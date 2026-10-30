package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

public record AuthResponse(
        String token,
        String tipo,
        long expiraEm,
        String nome
) {
}
