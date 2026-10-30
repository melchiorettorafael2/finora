package io.github.melchiorettorafael2.finora_api.dominio.lancamento;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.service.LancamentoService;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoDetalhes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.DateTimeException;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.UUID;

@RestController
@RequestMapping("lancamentos")
public class ListagemLancamentoController {

    @Autowired
    private LancamentoService service;

    @GetMapping
    public Page<LancamentoDetalhes> listar(
            @RequestParam(value = "page", required = false, defaultValue = "0") int page,
            @RequestParam(value = "size", required = false, defaultValue = "10") int size,
            @RequestParam(value = "mes", required = false) String mes,
            @RequestParam(value = "tipo", required = false) String tipo,
            @RequestParam(value = "categoria-id", required = false) UUID categoriaId
    ){
        var pageRequest = PageRequest.of(page, size);
        var mesAno = parseMes(mes);
        var tipoLancamentoSelecionado = parseTipo(tipo);

        return service.listar(pageRequest, mesAno, tipoLancamentoSelecionado, categoriaId);
    }

    @DeleteMapping("{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable UUID id){
        service.deletar(id);

    }


    private TipoLancamento parseTipo(String tipo) {
        if(tipo == null || tipo.isBlank()){
            return null;
        }

        try {
            return TipoLancamento.valueOf(tipo);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,
                    "Parametros 'tipo' invalido, valores aceitos: RECEITA ou DESPESA.");
        }
    }

    private YearMonth parseMes(String mes){
        if(mes == null || mes.isBlank()){
            return null;
        }

        try{
            return YearMonth.parse(mes);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,
            "Parametros 'mes' invalido, use o formato yyyy-MM.");
        }
    }
}
