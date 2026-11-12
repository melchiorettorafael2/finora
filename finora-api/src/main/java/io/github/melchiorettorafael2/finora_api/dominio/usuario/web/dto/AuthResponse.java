package io.github.melchiorettorafael2.finora_api.dominio.usuario.web.dto;

/**
 * Resposta do login/cadastro. A verificação em duas etapas é opcional (ativada em Configurações):
 * <ul>
 *   <li>Sem 2FA: já vem o token de acesso.</li>
 *   <li>Com 2FA: a senha correta devolve {@code doisFatoresPendente = true} e um {@code tokenDesafio},
 *       sem o token de acesso; o código do Google Authenticator vai em /auth/2fa/verificar.</li>
 * </ul>
 */
public record AuthResponse(
        String token,
        String tipo,
        long expiraEm,
        String nome,
        boolean doisFatoresPendente,
        String tokenDesafio
) {

    public static AuthResponse acesso(String token, long expiraEm, String nome) {
        return new AuthResponse(token, "Bearer", expiraEm, nome, false, null);
    }

    public static AuthResponse desafioDoisFatores(String tokenDesafio, long expiraEm) {
        return new AuthResponse(null, null, expiraEm, null, true, tokenDesafio);
    }
}
