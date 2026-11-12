package io.github.melchiorettorafael2.finora_api.dominio.categoria.web;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.service.CategoriaService;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaForm;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("categorias")
public class CategoriaController {

    @Autowired
    private CategoriaService service;

    @PostMapping
    public ResponseEntity<CategoriaDetalhes> criar(
            @RequestBody @Valid CategoriaForm nova){

        CategoriaDetalhes detalhes = service.criar(nova);
        return ResponseEntity.status(HttpStatus.CREATED).body(detalhes);
    }

    @GetMapping
    public Page<CategoriaDetalhes> listar(
           @RequestParam(value = "page", defaultValue = "0") int page,
           @RequestParam(value = "size", defaultValue = "10") int size

    ){
        var pageRequest = PageRequest.of(page,size);
        return service.listar(pageRequest);
    }

    @GetMapping("{id}")
    public ResponseEntity<CategoriaDetalhes> obterDetalhes(@PathVariable UUID id){
        return ResponseEntity.ok(service.obterDetalhes(id));
    }

    @PutMapping("{id}")
    public ResponseEntity<Void> atualizar(@PathVariable UUID id, @RequestBody @Valid CategoriaForm dados){
        service.atualizar(id, dados);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id){
        service.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("{id}/status")
    public ResponseEntity<Void> mudarStatus(@PathVariable UUID id){
        service.mudarStatus(id);
        return ResponseEntity.noContent().build();
    }

}
