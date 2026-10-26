package io.github.melchiorettorafael2.finora_api.dominio.lancamento.web;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.service.LancamentoService;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoForm;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("lancamentos")
@CrossOrigin("*")
public class CadastroLancamentoController {

    @Autowired
    private LancamentoService service;


    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public LancamentoDetalhes criar(@RequestBody @Valid LancamentoForm form){
        return service.criar(form);
    }


}
