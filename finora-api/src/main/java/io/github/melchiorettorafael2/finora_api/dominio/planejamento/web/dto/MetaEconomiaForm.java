package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record MetaEconomiaForm(
        @NotBlank(message = "Campo obrigatório")
        @Size(max = 100, message = "Máximo de 100 caracteres.")
        String nome,
        @NotBlank(message = "Campo obrigatório")
        String icone,
        @NotNull(message = "Campo obrigatório")
        @DecimalMin(value = "0.01", message = "O objetivo deve ser maior que zero.")
        BigDecimal objetivo,
        @NotNull(message = "Campo obrigatório")
        @DecimalMin(value = "0.00", message = "O valor guardado não pode ser negativo.")
        BigDecimal acumulado,
        @NotNull(message = "Campo obrigatório")
        LocalDate prazo
) {
}
