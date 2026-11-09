package io.github.melchiorettorafael2.finora_api.dominio.usuario;

import io.github.melchiorettorafael2.finora_api.common.exceptions.UnauthorizedException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.AuthResponse;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.LoginForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.UsuarioCadastroForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.VerificacaoDoisFatoresForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.ConfiguracaoDoisFatores;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.TokenDesafioForm;
import io.github.melchiorettorafael2.finora_api.infra.security.JwtService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private DoisFatoresService doisFatoresService;

    public AuthResponse cadastrar(UsuarioCadastroForm form){

        if(usuarioRepository.existsByLogin(form.login())){
            throw new ValidationException(List.of(new CampoInvalido("login", "Login já cadastrado.")));
        }

        // O nome também serve para entrar no sistema, então precisa ser único
        if(usuarioRepository.existsByNomeIgnoreCase(form.nome())){
            throw new ValidationException(List.of(new CampoInvalido("nome", "Nome de usuário já cadastrado.")));
        }

        String senhaCriptografada = encoder.encode(form.senha());

        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setNome(form.nome());
        usuario.setLogin(form.login());
        usuario.setSenha(senhaCriptografada);

        usuarioRepository.save(usuario);

        // 2FA é obrigatório: a conta nova ainda precisa configurar o Google Authenticator
        return desafioDoisFatores(usuario);
    }

    public AuthResponse autenticar(@Valid LoginForm form){
        final String msg = "Login ou senha inválidos.";
        // O campo login aceita o email ou o nome de usuário
        UsuarioEntity usuario = usuarioRepository.findByLogin(form.login())
                .or(() -> buscarPorNome(form.login()))
                .orElseThrow(() -> new UnauthorizedException(msg));

        boolean senhasBatem = encoder.matches(form.senha(), usuario.getSenha());

        if(!senhasBatem){
            throw new UnauthorizedException(msg);
        }

        // A senha nunca basta (2FA obrigatório): devolve só um token de desafio, trocado pelo
        // token de acesso depois do código do Google Authenticator
        return desafioDoisFatores(usuario);
    }

    /**
     * Quem já tem o app configurado recebe o desafio de digitar o código (/auth/2fa/verificar);
     * quem ainda não tem precisa configurar antes (/auth/2fa/configurar + /auth/2fa/ativar),
     * com mais tempo de validade, já que pode precisar instalar o aplicativo.
     */
    private AuthResponse desafioDoisFatores(UsuarioEntity usuario){
        if(usuario.possuiDoisFatoresAtivo()){
            return AuthResponse.desafioDoisFatores(
                    jwtService.gerarTokenDesafio(usuario, JwtService.EXPIRACAO_DESAFIO_SEGUNDOS),
                    JwtService.EXPIRACAO_DESAFIO_SEGUNDOS
            );
        }
        return AuthResponse.desafioConfiguracaoDoisFatores(
                jwtService.gerarTokenDesafio(usuario, JwtService.EXPIRACAO_DESAFIO_CONFIGURACAO_SEGUNDOS),
                JwtService.EXPIRACAO_DESAFIO_CONFIGURACAO_SEGUNDOS
        );
    }

    @Transactional
    public AuthResponse verificarDoisFatores(VerificacaoDoisFatoresForm form){
        UsuarioEntity usuario = usuarioDoDesafio(form.tokenDesafio(), true);
        doisFatoresService.confirmarCodigo(usuario, form.codigo());
        return toAuthResponse(usuario);
    }

    /** Primeiro acesso sem 2FA: gera o QR code a partir do token de desafio. */
    @Transactional
    public ConfiguracaoDoisFatores configurarDoisFatores(TokenDesafioForm form){
        UsuarioEntity usuario = usuarioDoDesafio(form.tokenDesafio(), false);
        return doisFatoresService.configurar(usuario.getId());
    }

    /** Confirma o primeiro código do app e já entrega o token de acesso. */
    @Transactional
    public AuthResponse ativarDoisFatores(VerificacaoDoisFatoresForm form){
        UsuarioEntity usuario = usuarioDoDesafio(form.tokenDesafio(), false);
        doisFatoresService.ativar(usuario.getId(), form.codigo());
        return toAuthResponse(usuario);
    }

    // O desafio só vale para a etapa certa: verificar exige 2FA ativo, configurar/ativar exige inativo
    private UsuarioEntity usuarioDoDesafio(String tokenDesafio, boolean doisFatoresAtivo){
        final String msg = "Sessão de verificação expirada. Faça login novamente.";
        UUID usuarioId = jwtService.validarTokenDesafio(tokenDesafio)
                .orElseThrow(() -> new UnauthorizedException(msg));

        return usuarioRepository.findById(usuarioId)
                .filter(usuario -> usuario.possuiDoisFatoresAtivo() == doisFatoresAtivo)
                .orElseThrow(() -> new UnauthorizedException(msg));
    }

    // Usuários antigos podem ter nome repetido: nesse caso só entra pelo email
    private Optional<UsuarioEntity> buscarPorNome(String nome){
        List<UsuarioEntity> usuarios = usuarioRepository.findByNomeIgnoreCase(nome);
        return usuarios.size() == 1 ? Optional.of(usuarios.get(0)) : Optional.empty();
    }

    public AuthResponse toAuthResponse(UsuarioEntity usuario){
        var token = jwtService.gerarToken(usuario);
        var expiraEm = jwtService.getExpirationSeconds();

        return AuthResponse.acesso(token, expiraEm, usuario.getNome());
    }


}
