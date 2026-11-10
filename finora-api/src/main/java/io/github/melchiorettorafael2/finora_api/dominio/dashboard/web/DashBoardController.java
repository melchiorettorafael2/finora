package io.github.melchiorettorafael2.finora_api.dominio.dashboard.web;

import io.github.melchiorettorafael2.finora_api.dominio.dashboard.repository.Dashboard;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;

@RestController
@RequestMapping("dashboard")
public class DashBoardController {

    @Autowired
    private DashboardService service;

    /** Sem o parâmetro "mes" (yyyy-MM), devolve o mês atual. */
    @GetMapping
    public Dashboard obterDashboard(@RequestParam(value = "mes", required = false) String mes){
      return service.obter(parseMes(mes));
    }

    private YearMonth parseMes(String mes) {
        if (mes == null || mes.isBlank()) {
            return YearMonth.now();
        }
        try {
            return YearMonth.parse(mes);
        } catch (DateTimeParseException e) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT,
                    "Parâmetro 'mes' inválido, use o formato yyyy-MM.");
        }
    }
}
