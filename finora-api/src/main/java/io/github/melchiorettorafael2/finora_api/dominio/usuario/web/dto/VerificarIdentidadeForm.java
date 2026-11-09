package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

/** 1ª etapa do "Esqueci minha senha": nome/email + código do Google Authenticator. */
public record VerificarIdentidadeForm(
        @NotBlank(message = "Informe o email ou nome de usuário")
        String login,
        @NotBlank(message = "Informe o código do aplicativo autenticador")
        @Pattern(regexp = "\\d{6}", message = "O código deve ter 6 dígitos")
        String codigo
) {
}
