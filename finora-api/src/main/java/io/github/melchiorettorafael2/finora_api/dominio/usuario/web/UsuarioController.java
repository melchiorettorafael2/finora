package io.github.melchiorettorafael2.finora_api.dominio.usuario.web;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.UsuarioService;
import io.github.melchiorettorafael2.finora_api.infra.demo.ContaDemo;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.AlterarSenhaForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.AuthResponse;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.UsuarioAtualizacaoForm;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto.UsuarioDetalhes;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

// Opera sempre sobre o usuário do token (atributo "usuario" definido pelo AuthInterceptor)
@RestController
@RequestMapping("usuarios/me")
public class UsuarioController {

    @Autowired
    private UsuarioService service;

    // Conta demo pública: perfil, senha e foto ficam bloqueados (ver ContaDemo)
    @Autowired
    private ContaDemo contaDemo;

    @GetMapping
    public UsuarioDetalhes obter(@RequestAttribute("usuario") UsuarioEntity usuario) {
        return service.obterDetalhes(usuario.getId());
    }

    @PutMapping
    public AuthResponse atualizar(@RequestAttribute("usuario") UsuarioEntity usuario,
                                  @RequestBody @Valid UsuarioAtualizacaoForm form) {
        contaDemo.bloquear(usuario);
        return service.atualizarDados(usuario.getId(), form);
    }

    @PatchMapping("senha")
    public ResponseEntity<Void> alterarSenha(@RequestAttribute("usuario") UsuarioEntity usuario,
                                             @RequestBody @Valid AlterarSenhaForm form) {
        contaDemo.bloquear(usuario);
        service.alterarSenha(usuario.getId(), form);
        return ResponseEntity.noContent().build();
    }

    // Sem foto cadastrada responde 204, para o front não registrar um 404 a cada página
    @GetMapping("foto")
    public ResponseEntity<byte[]> obterFoto(@RequestAttribute("usuario") UsuarioEntity usuario) {
        return service.obterFoto(usuario.getId())
                .map(foto -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(foto.getContentType()))
                        .cacheControl(CacheControl.noCache())
                        .body(foto.getConteudo()))
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @PutMapping(value = "foto", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Void> salvarFoto(@RequestAttribute("usuario") UsuarioEntity usuario,
                                           @RequestParam("foto") MultipartFile foto) {
        contaDemo.bloquear(usuario);
        service.salvarFoto(usuario.getId(), foto);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("foto")
    public ResponseEntity<Void> removerFoto(@RequestAttribute("usuario") UsuarioEntity usuario) {
        contaDemo.bloquear(usuario);
        service.removerFoto(usuario.getId());
        return ResponseEntity.noContent().build();
    }
}
