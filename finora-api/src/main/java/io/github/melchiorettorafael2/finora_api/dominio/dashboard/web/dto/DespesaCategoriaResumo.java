package io.github.melchiorettorafael2.finora_api.dominio.dashboard.web.dto;

import java.math.BigDecimal;

public record DespesaCategoriaResumo(
        String categoria,
        BigDecimal valor
) {
}
