package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record VerificacaoDoisFatoresForm(
        @NotBlank(message = "Sessão de verificação inválida. Faça login novamente.")
        String tokenDesafio,
        @NotBlank(message = "Informe o código do app")
        @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos")
        String codigo
) {
}
