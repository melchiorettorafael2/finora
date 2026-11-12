package io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CategoriaForm(
        @NotBlank(message = "Campo obrigatório") String nome,

        // Opcional; só aceita nomes de classe do Font Awesome (vai direto para o atributo class no front)
        @Size(max = 50, message = "Ícone inválido")
        @Pattern(regexp = "^fa-[a-z0-9-]+$", message = "Ícone inválido")
        String icone) {
}
