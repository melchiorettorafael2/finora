package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** "Esqueci minha senha": email que recebe o link de redefinição. */
public record SolicitarRedefinicaoSenhaForm(
        @NotBlank(message = "Informe o email")
        @Email(message = "Informe um email válido")
        String email
) {
}
