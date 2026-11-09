package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

/** Identidade confirmada: token para enviar com a nova senha em /auth/senha/redefinir. */
public record TokenRedefinicaoSenha(
        String tokenRedefinicao,
        long expiraEm
) {
}
