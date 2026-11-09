package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

import java.util.UUID;

public record UsuarioDetalhes(
        UUID id,
        String nome,
        String email,
        boolean possuiFoto
) {
}
