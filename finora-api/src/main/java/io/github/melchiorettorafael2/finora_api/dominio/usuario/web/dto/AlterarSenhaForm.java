package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AlterarSenhaForm(
        @NotBlank(message = "Informe a senha atual")
        String senhaAtual,
        @NotBlank(message = "Informe a nova senha")
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
        String novaSenha
) {
}
