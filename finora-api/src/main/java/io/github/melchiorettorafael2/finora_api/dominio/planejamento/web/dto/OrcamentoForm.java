package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.util.UUID;

public record OrcamentoForm(
        @NotNull(message = "Campo obrigatório")
        UUID categoriaId,
        @NotNull(message = "Campo obrigatório")
        @DecimalMin(value = "0.01", message = "O limite deve ser maior que zero.")
        BigDecimal limite
) {
}
