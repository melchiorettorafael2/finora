package io.github.melchiorettorafael2.finora_api.dominio.usuario.web;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.DoisFatoresService;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.CodigoDoisFatoresForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.ConfiguracaoDoisFatores;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.StatusDoisFatores;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Gerencia o 2FA do usuário do token (atributo "usuario" definido pelo AuthInterceptor)
@RestController
@RequestMapping("usuarios/me/2fa")
public class DoisFatoresController {

    @Autowired
    private DoisFatoresService service;

    @GetMapping
    public StatusDoisFatores status(@RequestAttribute("usuario") UsuarioEntity usuario) {
        return service.status(usuario.getId());
    }

    @PostMapping("configurar")
    public ConfiguracaoDoisFatores configurar(@RequestAttribute("usuario") UsuarioEntity usuario) {
        return service.configurar(usuario.getId());
    }

    @PostMapping("ativar")
    public ResponseEntity<Void> ativar(@RequestAttribute("usuario") UsuarioEntity usuario,
                                       @RequestBody @Valid CodigoDoisFatoresForm form) {
        service.ativar(usuario.getId(), form.codigo());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("desativar")
    public ResponseEntity<Void> desativar(@RequestAttribute("usuario") UsuarioEntity usuario,
                                          @RequestBody @Valid CodigoDoisFatoresForm form) {
        service.desativar(usuario.getId(), form.codigo());
        return ResponseEntity.noContent().build();
    }
}
