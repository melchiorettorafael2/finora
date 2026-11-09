package io.github.melchiorettorafael2.finora_api.dominio.usuario;

import io.github.melchiorettorafael2.finora_api.common.exceptions.UnauthorizedException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.AuthResponse;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.LoginForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.UsuarioCadastroForm;
import io.github.melchiorettorafael2.finora_api.infra.security.JwtService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AuthService {

    @Autowired
    private BCryptPasswordEncoder encoder;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private JwtService jwtService;

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

        return toAuthResponse(usuario);
    }

    // Usuários antigos podem ter nome repetido: nesse caso só entra pelo email
    private Optional<UsuarioEntity> buscarPorNome(String nome){
        List<UsuarioEntity> usuarios = usuarioRepository.findByNomeIgnoreCase(nome);
        return usuarios.size() == 1 ? Optional.of(usuarios.get(0)) : Optional.empty();
    }

    public AuthResponse toAuthResponse(UsuarioEntity usuario){
        var token = jwtService.gerarToken(usuario);
        var expiraEm = jwtService.getExpirationSeconds();

        return new AuthResponse(
                token,
           "Bearer",
                expiraEm,
                usuario.getNome()
        );


    }


}
