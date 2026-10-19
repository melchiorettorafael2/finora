package io.github.melchiorettorafael2.finora_api.dominio.cartao;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.dto.CartaoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.dto.CartaoForm;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("cartoes")
public class CartaoController {

    @Autowired
    private CartaoService service;

    @PostMapping
    public ResponseEntity<CartaoDetalhes> criar(@RequestBody @Valid CartaoForm novoCartao){
       CartaoDetalhes detalhes = service.criar(novoCartao);
       return ResponseEntity.status(HttpStatus.CREATED).body(detalhes);
    }

    @GetMapping("{id}")
    public ResponseEntity<CartaoDetalhes> obterDetalhes(@PathVariable UUID id){
        var result = service.obterDetalhes(id);
        return ResponseEntity.ok(result);
    }

    @PutMapping("{id}")
    public ResponseEntity<Void> atualizar(@PathVariable UUID id, @RequestBody CartaoForm dadosAtualizacao){
        service.atualizar(id, dadosAtualizacao);
        return ResponseEntity.noContent().build();

    }
}
