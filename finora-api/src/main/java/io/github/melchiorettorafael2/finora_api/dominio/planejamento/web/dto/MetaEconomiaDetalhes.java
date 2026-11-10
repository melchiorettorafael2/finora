package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaEconomiaDetalhes(
        String id,
        String nome,
        String icone,
        BigDecimal objetivo,
        BigDecimal acumulado,
        LocalDate prazo
) {
}
