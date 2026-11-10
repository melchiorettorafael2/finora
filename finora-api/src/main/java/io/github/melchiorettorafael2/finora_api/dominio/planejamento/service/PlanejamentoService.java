package io.github.melchiorettorafael2.finora_api.dominio.planejamento.service;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository.LancamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository.OrcamentoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.OrcamentoCategoria;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.Planejamento;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/** Monta a tela de Planejamento de um mês: limite de cada categoria x quanto já foi gasto nela, e as metas. */
@Service
public class PlanejamentoService {

    @Autowired
    private OrcamentoRepository orcamentoRepository;
    @Autowired
    private LancamentoRepository lancamentoRepository;
    @Autowired
    private MetaEconomiaService metaService;

    public Planejamento obter(YearMonth mes) {
        LocalDate inicio = mes.atDay(1);
        LocalDate fim = mes.atEndOfMonth();

        Map<UUID, BigDecimal> gastoPorCategoria = new HashMap<>();
        lancamentoRepository.somaPorCategoriaIdNoPeriodo(TipoLancamento.DESPESA, inicio, fim)
                .forEach(linha -> gastoPorCategoria.put((UUID) linha[0], (BigDecimal) linha[1]));

        List<OrcamentoCategoria> orcamentos = orcamentoRepository.findAllByOrderByCategoriaNomeAsc().stream()
                .map(o -> new OrcamentoCategoria(
                        o.getId().toString(),
                        o.getCategoria().getId().toString(),
                        o.getCategoria().getNome(),
                        o.getLimite(),
                        gastoPorCategoria.getOrDefault(o.getCategoria().getId(), BigDecimal.ZERO)))
                .toList();

        return new Planejamento(
                mes.toString(),
                lancamentoRepository.somaPorTipoPeriodo(TipoLancamento.RECEITA, inicio, fim),
                orcamentos,
                metaService.listar()
        );
    }
}
