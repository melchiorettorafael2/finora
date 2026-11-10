package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto;

import java.math.BigDecimal;

public record OrcamentoCategoria(
        String id,
        String categoriaId,
        String categoria,
        BigDecimal limite,
        BigDecimal gasto
) {
}
