package io.github.melchiorettorafael2.finora_api.dominio.dashboard.web;

import io.github.melchiorettorafael2.finora_api.dominio.dashboard.repository.Dashboard;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("dashboard")
public class DashBoardController {

    @Autowired
    private DashboardService service;

    @GetMapping
    public Dashboard obterDashboardMesAtual(){
      return service.obterDashboardMesAtual();
    }
}
