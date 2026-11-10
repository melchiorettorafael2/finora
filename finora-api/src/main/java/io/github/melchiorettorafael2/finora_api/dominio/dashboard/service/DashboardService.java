package io.github.melchiorettorafael2.finora_api.dominio.dashboard.service;

import io.github.melchiorettorafael2.finora_api.dominio.dashboard.repository.Dashboard;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.DespesaCategoriaResumo;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.ResumoFinanceiro;
import io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto.ResumoOrcamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository.LancamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.mapper.LancamentoMapper;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.service.PlanejamentoService;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.OrcamentoCategoria;
import io.github.melchiorettorafael2.finora_api.dominio.relatorio.service.RelatorioService;
import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

@Service
public class DashboardService {

    private static final int MESES_EVOLUCAO = 6;

    @Autowired
    private LancamentoRepository repository;
    @Autowired
    private LancamentoMapper lancamentoMapper;
    @Autowired
    private PlanejamentoService planejamentoService;
    @Autowired
    private RelatorioService relatorioService;
    @Autowired
    private UsuarioLogado usuarioLogado;

    public Dashboard obter(YearMonth mes) {
        UUID usuarioId = usuarioLogado.id();
        LocalDate primeiroDiaMes = mes.atDay(1);
        LocalDate ultimoDia = mes.atEndOfMonth();

        List<DespesaCategoriaResumo> despesaPorCategoria = repository.somaPorCategoriaNoPeriodo(usuarioId, TipoLancamento.DESPESA, primeiroDiaMes, ultimoDia)
                .stream()
                .map( resultado ->
                        new DespesaCategoriaResumo((String) resultado[0], (BigDecimal) resultado[1])
                ).toList();

        return new Dashboard(
                mes.toString(),
                resumo(usuarioId, mes),
                resumo(usuarioId, mes.minusMonths(1)),
                despesaPorCategoria,
                resumoOrcamento(mes),
                relatorioService.evolucao(mes, MESES_EVOLUCAO),
                repository.findTop5ByUsuarioIdAndDataBetweenOrderByDataDesc(usuarioId, primeiroDiaMes, ultimoDia).stream()
                        .map(lancamentoMapper::toDetalhes)
                        .toList()
        );
    }

    private ResumoFinanceiro resumo(UUID usuarioId, YearMonth mes) {
        BigDecimal receitas = repository.somaPorTipoPeriodo(usuarioId, TipoLancamento.RECEITA, mes.atDay(1), mes.atEndOfMonth());
        BigDecimal despesas = repository.somaPorTipoPeriodo(usuarioId, TipoLancamento.DESPESA, mes.atDay(1), mes.atEndOfMonth());
        return new ResumoFinanceiro(receitas, despesas, receitas.subtract(despesas));
    }

    private ResumoOrcamento resumoOrcamento(YearMonth mes) {
        List<OrcamentoCategoria> orcamentos = planejamentoService.obter(mes).orcamentos();
        if (orcamentos.isEmpty()) {
            return null;
        }

        return new ResumoOrcamento(
                orcamentos.stream().map(OrcamentoCategoria::limite).reduce(BigDecimal.ZERO, BigDecimal::add),
                orcamentos.stream().map(OrcamentoCategoria::gasto).reduce(BigDecimal.ZERO, BigDecimal::add),
                orcamentos.stream().filter(o -> o.gasto().compareTo(o.limite()) > 0).count()
        );
    }
}
