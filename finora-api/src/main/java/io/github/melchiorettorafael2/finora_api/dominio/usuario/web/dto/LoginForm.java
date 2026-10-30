package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginForm(
        @NotBlank(message = "Informe o login")
        String login,
        @NotBlank(message = "Informe a senha")
        String senha
) {
}
