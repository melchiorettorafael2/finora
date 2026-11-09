package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record CodigoDoisFatoresForm(
        @NotBlank(message = "Informe o código do aplicativo autenticador")
        @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos")
        String codigo
) {
}
