package io.github.melchiorettorafael2.finora_api.dominio.dashboard.repository;

import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.DespesaCategoriaResumo;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.ResumoFinanceiro;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.ResumoOrcamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto.ResumoMensal;

import java.util.List;

/**
 * @param resumoMesAnterior para mostrar a variação de receitas e despesas nos cards
 * @param orcamento         null quando nenhum orçamento foi definido no Planejamento
 * @param evolucao          receitas e despesas dos últimos 6 meses, terminando no mês consultado
 */
public record Dashboard (
    String mes,
    ResumoFinanceiro resumo,
    ResumoFinanceiro resumoMesAnterior,
    List<DespesaCategoriaResumo> despesasPorCategoria,
    ResumoOrcamento orcamento,
    List<ResumoMensal> evolucao,
    List<LancamentoDetalhes> ultimosLancamentos
){

}
