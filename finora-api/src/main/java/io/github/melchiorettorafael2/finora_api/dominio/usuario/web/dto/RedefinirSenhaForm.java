package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** 2ª etapa do "Esqueci minha senha": nova senha + token emitido em /auth/senha/verificar. */
public record RedefinirSenhaForm(
        @NotBlank(message = "Confirme sua identidade novamente.")
        String tokenRedefinicao,
        @NotBlank(message = "Informe a nova senha")
        @Size(min = 6, message = "A senha deve ter pelo menos 6 caracteres")
        String novaSenha
) {
}
