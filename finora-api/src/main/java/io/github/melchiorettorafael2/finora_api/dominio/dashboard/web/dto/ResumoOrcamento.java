package io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto;

import java.math.BigDecimal;

/** Soma dos orçamentos do Planejamento no mês: quanto do limite total já foi gasto. */
public record ResumoOrcamento(
        BigDecimal limite,
        BigDecimal gasto,
        long categoriasAcimaDoLimite
) {
}
