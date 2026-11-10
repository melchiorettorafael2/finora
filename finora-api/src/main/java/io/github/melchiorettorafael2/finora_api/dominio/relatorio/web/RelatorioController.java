package io.github.melchiorettorafael2.finora_api.dominio.relatorio.web;

import io.github.melchiorettorafael2.finora_api.dominio.relatorio.service.RelatorioService;
import io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto.Relatorio;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.util.Set;

@RestController
@RequestMapping("relatorios")
public class RelatorioController {

    private static final Set<Integer> PERIODOS_ACEITOS = Set.of(3, 6, 12);

    @Autowired
    private RelatorioService service;

    @GetMapping
    public Relatorio gerar(@RequestParam(value = "meses", defaultValue = "6") int meses) {
        if (!PERIODOS_ACEITOS.contains(meses)) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,
                    "Parâmetro 'meses' inválido, valores aceitos: 3, 6 ou 12.");
        }
        return service.gerar(meses);
    }
}
