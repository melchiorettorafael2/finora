package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
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

    // Segunda etapa do login com 2FA: troca o token de desafio + código pelo token de acesso
    @PostMapping("/2fa/verificar")
    public AuthResponse verificarDoisFatores(@RequestBody @Valid VerificacaoDoisFatoresForm form){
        return service.verificarDoisFatores(form);
    }

    // Primeiro acesso (2FA obrigatório): gera o QR code do Google Authenticator
    @PostMapping("/2fa/configurar")
    public ConfiguracaoDoisFatores configurarDoisFatores(@RequestBody @Valid TokenDesafioForm form){
        return service.configurarDoisFatores(form);
    }

    // Primeiro acesso: confirma o código do app, ativa o 2FA e entrega o token de acesso
    @PostMapping("/2fa/ativar")
    public AuthResponse ativarDoisFatores(@RequestBody @Valid VerificacaoDoisFatoresForm form){
        return service.ativarDoisFatores(form);
    }

}
