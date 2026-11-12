package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("auth")
public class AuthController {

    @Autowired
    private AuthService service;

    @PostMapping("/signup")
    public AuthResponse cadastrar(@RequestBody @Valid UsuarioCadastroForm form){
        return service.cadastrar(form);
    }

    @PostMapping("/signin")
    public AuthResponse autenticar(@RequestBody @Valid LoginForm form, HttpServletRequest request){
        var ususario = request.getAttribute("usuarioAutenticado");
        return service.autenticar(form);
    }

    // Segunda etapa do login (só para quem ativou o 2FA em Configurações): troca o token de desafio + código pelo token de acesso
    @PostMapping("/2fa/verificar")
    public AuthResponse verificarDoisFatores(@RequestBody @Valid VerificacaoDoisFatoresForm form){
        return service.verificarDoisFatores(form);
    }


    // "Esqueci minha senha", 1ª etapa: nome/email + código do Google Authenticator
    @PostMapping("/senha/verificar")
    public TokenRedefinicaoSenha verificarIdentidadeParaSenha(@RequestBody @Valid VerificarIdentidadeForm form){
        return service.verificarIdentidadeParaSenha(form);
    }

    // "Esqueci minha senha", 2ª etapa: grava a nova senha com o token da 1ª (não inicia sessão)
    @PostMapping("/senha/redefinir")
    public ResponseEntity<Void> redefinirSenha(@RequestBody @Valid RedefinirSenhaForm form){
        service.redefinirSenha(form);
        return ResponseEntity.noContent().build();
    }


}
