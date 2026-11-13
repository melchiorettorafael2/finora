package io.github.melchiorettorafael2.finora_api.dominio.usuario;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.FotoUsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.infra.demo.ContaDemo;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.FotoUsuarioRepository;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.AlterarSenhaForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.AuthResponse;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.UsuarioAtualizacaoForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.UsuarioDetalhes;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

@Service
public class UsuarioService {

    public static final long TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB
    private static final Set<String> TIPOS_FOTO_PERMITIDOS = Set.of("image/jpeg", "image/png", "image/webp");

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private FotoUsuarioRepository fotoRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private ContaDemo contaDemo;

    public UsuarioDetalhes obterDetalhes(UUID usuarioId) {
        UsuarioEntity usuario = buscar(usuarioId);
        return new UsuarioDetalhes(
                usuario.getId(),
                usuario.getNome(),
                usuario.getLogin(),
                fotoRepository.existsById(usuarioId),
                usuario.possuiDoisFatoresAtivo(),
                contaDemo.ehDemo(usuario)
        );
    }

    // Devolve um novo token, já que o nome do usuário faz parte do payload do JWT
    @Transactional
    public AuthResponse atualizarDados(UUID usuarioId, UsuarioAtualizacaoForm form) {
        UsuarioEntity usuario = buscar(usuarioId);
        String nome = form.nome().trim();
        String email = form.email().trim();

        ValidationResult result = ValidationResult.novo();
        if (usuarioRepository.existsByLoginAndIdNot(email, usuarioId)) {
            result.add(new CampoInvalido("email", "Email já cadastrado."));
        }
        // O nome também serve para entrar no sistema, então precisa ser único
        if (usuarioRepository.existsByNomeIgnoreCaseAndIdNot(nome, usuarioId)) {
            result.add(new CampoInvalido("nome", "Nome de usuário já cadastrado."));
        }
        if (result.isInvalido()) {
            throw new ValidationException(result.getCamposInvalidos());
        }

        usuario.setNome(nome);
        usuario.setLogin(email);
        usuarioRepository.save(usuario);

        return authService.toAuthResponse(usuario);
    }

    // Senha atual errada vira erro de validação (422) e não 401,
    // porque o front faz logout automático ao receber 401
    @Transactional
    public void alterarSenha(UUID usuarioId, AlterarSenhaForm form) {
        UsuarioEntity usuario = buscar(usuarioId);

        if (!encoder.matches(form.senhaAtual(), usuario.getSenha())) {
            throw new ValidationException(List.of(new CampoInvalido("senhaAtual", "Senha atual incorreta.")));
        }
        if (form.senhaAtual().equals(form.novaSenha())) {
            throw new ValidationException(List.of(new CampoInvalido("novaSenha", "A nova senha deve ser diferente da atual.")));
        }

        usuario.setSenha(encoder.encode(form.novaSenha()));
        usuarioRepository.save(usuario);
    }

    @Transactional
    public void salvarFoto(UUID usuarioId, MultipartFile arquivo) {
        if (arquivo == null || arquivo.isEmpty()) {
            throw new ValidationException(List.of(new CampoInvalido("foto", "Selecione uma imagem.")));
        }
        if (!TIPOS_FOTO_PERMITIDOS.contains(arquivo.getContentType())) {
            throw new ValidationException(List.of(new CampoInvalido("foto", "Formato inválido. Use JPG, PNG ou WEBP.")));
        }
        if (arquivo.getSize() > TAMANHO_MAXIMO_FOTO) {
            throw new ValidationException(List.of(new CampoInvalido("foto", "A imagem deve ter no máximo 2 MB.")));
        }

        buscar(usuarioId);

        FotoUsuarioEntity foto = fotoRepository.findById(usuarioId).orElseGet(FotoUsuarioEntity::new);
        foto.setUsuarioId(usuarioId);
        foto.setContentType(arquivo.getContentType());
        try {
            foto.setConteudo(arquivo.getBytes());
        } catch (IOException e) {
            throw new UncheckedIOException("Erro ao ler a imagem enviada.", e);
        }
        fotoRepository.save(foto);
    }

    public Optional<FotoUsuarioEntity> obterFoto(UUID usuarioId) {
        return fotoRepository.findById(usuarioId);
    }

    @Transactional
    public void removerFoto(UUID usuarioId) {
        if (fotoRepository.existsById(usuarioId)) {
            fotoRepository.deleteById(usuarioId);
        }
    }

    private UsuarioEntity buscar(UUID usuarioId) {
        return usuarioRepository.findById(usuarioId).orElseThrow(RegistroNaoEncontradoException::new);
    }
}
