package io.github.melchiorettorafael2.finora_api.dominio.relatorio.web.dto;

import java.math.BigDecimal;

public record CategoriaRelatorio(
        String categoria,
        BigDecimal valor
) {
}
