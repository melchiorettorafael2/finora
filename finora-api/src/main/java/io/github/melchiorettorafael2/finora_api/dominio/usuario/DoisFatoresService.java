package io.github.melchiorettorafael2.finora_api.dominio.usuario;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.ConfiguracaoDoisFatores;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.StatusDoisFatores;
import io.github.melchiorettorafael2.finora_api.infra.security.LimiteTentativasDoisFatores;
import io.github.melchiorettorafael2.finora_api.infra.security.TotpService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.OptionalLong;
import java.util.UUID;

/**
 * Configuração da autenticação em dois fatores (TOTP) do usuário logado:
 * configurar (gera segredo pendente) → ativar (confirma com um código) → desativar.
 */
@Service
public class DoisFatoresService {

    private static final String CAMPO = "codigo";

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private TotpService totpService;

    @Autowired
    private LimiteTentativasDoisFatores limiteTentativas;

    public StatusDoisFatores status(UUID usuarioId) {
        return new StatusDoisFatores(buscar(usuarioId).possuiDoisFatoresAtivo());
    }

    // Gera um segredo novo a cada chamada; o anterior (se não confirmado) é descartado
    @Transactional
    public ConfiguracaoDoisFatores configurar(UUID usuarioId) {
        UsuarioEntity usuario = buscar(usuarioId);
        if (usuario.possuiDoisFatoresAtivo()) {
            throw erro("A autenticação em dois fatores já está ativa.");
        }

        String segredo = totpService.gerarSegredo();
        usuario.setTotpSegredoPendente(segredo);
        usuarioRepository.save(usuario);

        return new ConfiguracaoDoisFatores(
                segredo,
                totpService.gerarUri(segredo, usuario.getLogin()),
                TotpService.EMISSOR,
                usuario.getLogin()
        );
    }

    @Transactional
    public void ativar(UUID usuarioId, String codigo) {
        UsuarioEntity usuario = buscar(usuarioId);
        if (usuario.possuiDoisFatoresAtivo()) {
            throw erro("A autenticação em dois fatores já está ativa.");
        }
        if (usuario.getTotpSegredoPendente() == null) {
            throw erro("Configuração não encontrada. Gere um novo QR code.");
        }
        verificarBloqueio(usuarioId);

        OptionalLong passo = totpService.validar(usuario.getTotpSegredoPendente(), codigo, null);
        if (passo.isEmpty()) {
            limiteTentativas.registrarFalha(usuarioId);
            throw erro("Código inválido. Confira o código no aplicativo e tente novamente.");
        }

        limiteTentativas.limpar(usuarioId);
        usuario.setTotpSegredo(usuario.getTotpSegredoPendente());
        usuario.setTotpSegredoPendente(null);
        usuario.setTotpUltimoPasso(passo.getAsLong());
        usuario.setDoisFatoresAtivo(true);
        usuarioRepository.save(usuario);
    }

    // Exige um código válido para desativar: quem só tem a sessão aberta não consegue tirar a proteção
    @Transactional
    public void desativar(UUID usuarioId, String codigo) {
        UsuarioEntity usuario = buscar(usuarioId);
        if (!usuario.possuiDoisFatoresAtivo()) {
            throw erro("A autenticação em dois fatores não está ativa.");
        }
        confirmarCodigo(usuario, codigo);

        usuario.setTotpSegredo(null);
        usuario.setTotpSegredoPendente(null);
        usuario.setTotpUltimoPasso(null);
        usuario.setDoisFatoresAtivo(false);
        usuarioRepository.save(usuario);
    }

    /**
     * Valida o código contra o segredo ativo, aplicando o limite de tentativas e
     * a proteção contra reuso. Lança erro de validação se o código não for aceito.
     */
    @Transactional
    public void confirmarCodigo(UsuarioEntity usuario, String codigo) {
        verificarBloqueio(usuario.getId());

        OptionalLong passo = totpService.validar(usuario.getTotpSegredo(), codigo, usuario.getTotpUltimoPasso());
        if (passo.isEmpty()) {
            limiteTentativas.registrarFalha(usuario.getId());
            throw erro("Código inválido ou já utilizado.");
        }

        limiteTentativas.limpar(usuario.getId());
        usuario.setTotpUltimoPasso(passo.getAsLong());
        usuarioRepository.save(usuario);
    }

    private void verificarBloqueio(UUID usuarioId) {
        if (limiteTentativas.isBloqueado(usuarioId)) {
            throw erro("Muitas tentativas inválidas. Aguarde alguns minutos e tente novamente.");
        }
    }

    private ValidationException erro(String mensagem) {
        return new ValidationException(List.of(new CampoInvalido(CAMPO, mensagem)));
    }

    private UsuarioEntity buscar(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId).orElseThrow(RegistroNaoEncontradoException::new);
    }
}
