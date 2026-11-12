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
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.RedefinirSenhaForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.TokenRedefinicaoSenha;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.VerificarIdentidadeForm;
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

        // Conta nova entra direto: a verificação em duas etapas é opcional e ativada em Configurações
        return toAuthResponse(usuario);
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

        // Com 2FA ativo a senha não basta: devolve só um token de desafio, trocado pelo
        // token de acesso depois do código do Google Authenticator (/auth/2fa/verificar)
        if (usuario.possuiDoisFatoresAtivo()) {
            return AuthResponse.desafioDoisFatores(
                    jwtService.gerarTokenDesafio(usuario, JwtService.EXPIRACAO_DESAFIO_SEGUNDOS),
                    JwtService.EXPIRACAO_DESAFIO_SEGUNDOS
            );
        }
        return toAuthResponse(usuario);
    }

    @Transactional
    public AuthResponse verificarDoisFatores(VerificacaoDoisFatoresForm form){
        UsuarioEntity usuario = usuarioDoDesafio(form.tokenDesafio());
        doisFatoresService.confirmarCodigo(usuario, form.codigo());
        return toAuthResponse(usuario);
    }

    /**
     * 1ª etapa do "Esqueci minha senha" (sem e-mail): o código atual do Google Authenticator
     * comprova que é o dono da conta, por isso só funciona para contas com 2FA ativo. Usa o mesmo limite de tentativas e a
     * mesma proteção contra reuso de código do login. Se conferir, devolve o token de redefinição.
     */
    @Transactional
    public TokenRedefinicaoSenha verificarIdentidadeParaSenha(VerificarIdentidadeForm form){
        // Mesma mensagem do código errado (DoisFatoresService.confirmarCodigo) para usuário
        // inexistente ou sem 2FA: assim a resposta não revela quais contas existem
        final String msg = "Código inválido ou já utilizado.";
        String login = form.login().trim();
        UsuarioEntity usuario = usuarioRepository.findByLogin(login)
                .or(() -> buscarPorNome(login))
                .filter(UsuarioEntity::possuiDoisFatoresAtivo)
                .orElseThrow(() -> new ValidationException(List.of(new CampoInvalido("codigo", msg))));

        doisFatoresService.confirmarCodigo(usuario, form.codigo());

        return new TokenRedefinicaoSenha(
                jwtService.gerarTokenRedefinicaoSenha(usuario),
                JwtService.EXPIRACAO_REDEFINICAO_SENHA_SEGUNDOS
        );
    }

    /** 2ª etapa: grava a nova senha. O token deixa de valer depois disso (uso único). */
    @Transactional
    public void redefinirSenha(RedefinirSenhaForm form){
        UsuarioEntity usuario = jwtService.validarTokenRedefinicaoSenha(form.tokenRedefinicao())
                .flatMap(usuarioRepository::findById)
                .orElseThrow(() -> new UnauthorizedException("A confirmação de identidade expirou. Comece novamente."));

        usuario.setSenha(encoder.encode(form.novaSenha()));
        usuarioRepository.save(usuario);
    }

    // O desafio só vale enquanto o 2FA continuar ativo
    private UsuarioEntity usuarioDoDesafio(String tokenDesafio){
        final String msg = "Sessão de verificação expirada. Faça login novamente.";
        UUID usuarioId = jwtService.validarTokenDesafio(tokenDesafio)
                .orElseThrow(() -> new UnauthorizedException(msg));

        return usuarioRepository.findById(usuarioId)
                .filter(UsuarioEntity::possuiDoisFatoresAtivo)
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
