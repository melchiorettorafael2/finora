package io.github.melchiorettorafael2.finora_api.dominio.relatorio.service;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository.LancamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto.CategoriaRelatorio;
import io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto.Relatorio;
import io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto.ResumoMensal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

/** Relatório dos últimos N meses, contando o mês atual. */
@Service
public class RelatorioService {

    @Autowired
    private LancamentoRepository repository;

    public Relatorio gerar(int meses) {
        YearMonth primeiroMes = YearMonth.now().minusMonths(meses - 1L);
        LocalDate inicio = primeiroMes.atDay(1);
        LocalDate fim = YearMonth.now().atEndOfMonth();

        List<CategoriaRelatorio> categorias = repository.somaPorCategoriaNoPeriodo(TipoLancamento.DESPESA, inicio, fim)
                .stream()
                .map(linha -> new CategoriaRelatorio((String) linha[0], (BigDecimal) linha[1]))
                .toList();

        return new Relatorio(meses, resumoMensal(primeiroMes, meses, inicio, fim), categorias);
    }

    private List<ResumoMensal> resumoMensal(YearMonth primeiroMes, int meses, LocalDate inicio, LocalDate fim) {
        Map<YearMonth, BigDecimal> receitas = new HashMap<>();
        Map<YearMonth, BigDecimal> despesas = new HashMap<>();

        for (Object[] linha : repository.somaPorMesETipoNoPeriodo(inicio, fim)) {
            var mes = YearMonth.of(((Number) linha[0]).intValue(), ((Number) linha[1]).intValue());
            var destino = linha[2] == TipoLancamento.RECEITA ? receitas : despesas;
            destino.put(mes, (BigDecimal) linha[3]);
        }

        // Meses sem lançamentos também aparecem, zerados, para o gráfico não ter buracos
        return IntStream.range(0, meses)
                .mapToObj(primeiroMes::plusMonths)
                .map(mes -> new ResumoMensal(
                        mes.toString(),
                        receitas.getOrDefault(mes, BigDecimal.ZERO),
                        despesas.getOrDefault(mes, BigDecimal.ZERO)))
                .toList();
    }
}
