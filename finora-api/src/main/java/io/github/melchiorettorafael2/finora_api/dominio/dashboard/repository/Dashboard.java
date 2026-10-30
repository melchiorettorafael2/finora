package io.github.melchiorettorafael2.finora_api.dominio.dashboard.repository;

import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.DespesaCategoriaResumo;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.ResumoFinanceiro;

import java.util.List;

public record Dashboard (
    String mes,
    ResumoFinanceiro resumo,
    List<DespesaCategoriaResumo> despesasPorCategoria
){

}
