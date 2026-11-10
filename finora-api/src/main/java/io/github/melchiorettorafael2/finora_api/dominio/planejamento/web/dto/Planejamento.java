package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto;

import java.math.BigDecimal;
import java.util.List;

/** Tudo o que a tela de Planejamento precisa para um mês, em uma única resposta (BFF). */
public record Planejamento(
        String mes,
        BigDecimal receitasMes,
        List<OrcamentoCategoria> orcamentos,
        List<MetaEconomiaDetalhes> metas
) {
}
