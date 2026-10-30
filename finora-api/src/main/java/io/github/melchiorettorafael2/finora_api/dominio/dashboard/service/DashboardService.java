package io.github.melchiorettorafael2.finora_api.dominio.dashboard.service;

import io.github.melchiorettorafael2.finora_api.dominio.dashboard.repository.Dashboard;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.DespesaCategoriaResumo;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.ResumoFinanceiro;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository.LancamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class DashboardService {

    @Autowired
    private LancamentoRepository repository;

    public Dashboard obterDashboardMesAtual() {
        YearMonth mesAtual = YearMonth.now();
        LocalDate primeiroDiaMes = mesAtual.atDay(1);
        LocalDate ultimoDia = mesAtual.atEndOfMonth();

        BigDecimal receitas = repository.somaPorTipoPeriodo(TipoLancamento.RECEITA, primeiroDiaMes, ultimoDia);
        BigDecimal despesas = repository.somaPorTipoPeriodo(TipoLancamento.DESPESA, primeiroDiaMes, ultimoDia);;
        BigDecimal saldo = receitas.subtract(despesas);

        ResumoFinanceiro resumoFinanceiro = new ResumoFinanceiro(receitas, despesas, saldo);

        List<DespesaCategoriaResumo> despesaPorCategoria = repository.somaPorCategoriaNoPeriodo(TipoLancamento.DESPESA, primeiroDiaMes, ultimoDia)
                .stream()
                .map( resultado ->
                        new DespesaCategoriaResumo((String) resultado[0], (BigDecimal) resultado[1])
                ).toList();

        return new Dashboard(
                mesAtual.toString(),
                resumoFinanceiro,
                despesaPorCategoria
        );
    }
}
