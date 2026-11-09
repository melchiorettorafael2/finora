package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record UsuarioAtualizacaoForm(
        @NotBlank(message = "Informe o nome do usuário")
        String nome,
        @NotBlank(message = "Informe o email")
        @Email(message = "Informe um email válido")
        String email
) {
}
