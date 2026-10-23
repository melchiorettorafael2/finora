package io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CategoriaForm(
        @NotBlank(message = "Campo obrigatório") String nome) {
}
