package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** "Esqueci minha senha": nova senha + token do link enviado por e-mail (/auth/senha/esqueci). */
public record RedefinirSenhaForm(
        @NotBlank(message = "Link inválido. Peça outro.")
        String tokenRedefinicao,
        @NotBlank(message = "Informe a nova senha")
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
        String novaSenha
) {
}
