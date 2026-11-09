package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

/**
 * Resposta do login/cadastro. Como o 2FA é obrigatório, a senha correta devolve
 * {@code doisFatoresPendente = true} e um {@code tokenDesafio}, sem o token de acesso:
 * <ul>
 *   <li>{@code configuracaoDoisFatoresPendente = false}: o usuário já tem o Google Authenticator;
 *       envia o código em /auth/2fa/verificar.</li>
 *   <li>{@code configuracaoDoisFatoresPendente = true}: primeiro acesso; gera o QR code em
 *       /auth/2fa/configurar e confirma o código em /auth/2fa/ativar.</li>
 * </ul>
 * O token de acesso só vem na resposta de /auth/2fa/verificar ou /auth/2fa/ativar.
 */
public record AuthResponse(
        String token,
        String tipo,
        long expiraEm,
        String nome,
        boolean doisFatoresPendente,
        boolean configuracaoDoisFatoresPendente,
        String tokenDesafio
) {

    public static AuthResponse acesso(String token, long expiraEm, String nome) {
        return new AuthResponse(token, "Bearer", expiraEm, nome, false, false, null);
    }

    public static AuthResponse desafioDoisFatores(String tokenDesafio, long expiraEm) {
        return new AuthResponse(null, null, expiraEm, null, true, false, tokenDesafio);
    }

    public static AuthResponse desafioConfiguracaoDoisFatores(String tokenDesafio, long expiraEm) {
        return new AuthResponse(null, null, expiraEm, null, true, true, tokenDesafio);
    }
}
