package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;

public record TokenDesafioForm(
        @NotBlank(message = "Sessão de verificação inválida. Faça login novamente.")
        String tokenDesafio
) {
}
