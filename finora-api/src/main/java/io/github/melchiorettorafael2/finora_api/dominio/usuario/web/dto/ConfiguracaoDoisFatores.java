package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

/**
 * Dados para o usuário cadastrar a conta no app autenticador:
 * {@code otpauthUri} vira o QR code e {@code segredo} é a chave para digitação manual.
 */
public record ConfiguracaoDoisFatores(
        String segredo,
        String otpauthUri,
        String emissor,
        String conta
) {
}
