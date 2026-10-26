package io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

public record LancamentoForm(
        @NotNull(message = "Campo obrigatorio")
        UUID categoriaId,
        @NotNull(message = "Campo obrigatorio")
        TipoLancamento tipo,
        LocalDate data,
        @NotNull(message = "Campo obrigatorio")
        @DecimalMin(value = "0.01", message = "Valor deve ser maior que zero.")
        BigDecimal valor,
        @NotNull(message = "Campo obrigatorio")
        UUID cartaoId
) {
}
