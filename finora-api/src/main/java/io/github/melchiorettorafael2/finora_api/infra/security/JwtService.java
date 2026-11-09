package io.github.melchiorettorafael2.finora_api.infra.security;

import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Base64;
import java.util.Optional;
import java.util.UUID;

@Service
public class JwtService {

    private static final String ALGORITMO = "HmacSHA256";

    // Token emitido após a senha correta quando o usuário tem 2FA: só serve para
    // trocar pelo token de acesso em /auth/2fa/verificar, nunca para acessar a API
    private static final String ESCOPO_DESAFIO_2FA = "2fa";
    public static final long EXPIRACAO_DESAFIO_SEGUNDOS = 300;
    // Primeiro acesso: tempo para instalar o app e escanear o QR code
    public static final long EXPIRACAO_DESAFIO_CONFIGURACAO_SEGUNDOS = 900;

    // "Esqueci minha senha": só serve em /auth/senha/redefinir, nunca para acessar a API
    private static final String ESCOPO_REDEFINICAO_SENHA = "senha";
    public static final long EXPIRACAO_REDEFINICAO_SENHA_SEGUNDOS = 600;

    private final ObjectMapper objectMapper;

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration-seconds}")
    private Long expirationSeconds;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public JwtService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Long getExpirationSeconds() {
        return expirationSeconds;
    }

    public String gerarToken(UsuarioEntity usuario){
        long expiration = Instant.now().plusSeconds(expirationSeconds).getEpochSecond();
        String payload = """
                {"sub": "%s", "nome": "%s", "exp": %d }
                """.formatted(usuario.getId().toString(), usuario.getNome(), expiration);

        return montarToken(payload);
    }

    public String gerarTokenDesafio(UsuarioEntity usuario, long expiracaoSegundos){
        long expiration = Instant.now().plusSeconds(expiracaoSegundos).getEpochSecond();
        String payload = """
                {"sub": "%s", "escopo": "%s", "exp": %d }
                """.formatted(usuario.getId().toString(), ESCOPO_DESAFIO_2FA, expiration);

        return montarToken(payload);
    }

    private String montarToken(String payloadJson){
        String header = base64Url("""
                {"alg": "HS256", "type": "JWT"}
                """);
        String payload = base64Url(payloadJson);
        String signature = assinar(header + "." + payload);

        return header + "." + payload + "." + signature;
    }

    private String assinar(String conteudo) {
        try {
            Mac mac = Mac.getInstance(ALGORITMO);
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), ALGORITMO));
            byte[] assinatura = mac.doFinal(conteudo.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(assinatura);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            throw new IllegalStateException("Erro ao assinar token.", e);
        }
    }

    private String base64Url(String valor){
        return Base64.getUrlEncoder()
                .withoutPadding()
                .encodeToString(valor.getBytes(StandardCharsets.UTF_8));
    }

    /** Token de acesso: assinatura válida, não expirado e sem escopo restrito. */
    public boolean isTokenValido(String token) {
        return lerPayloadValido(token)
                .map(json -> !json.has("escopo"))
                .orElse(false);
    }

    /** Devolve o id do usuário se o token for um desafio de 2FA válido. */
    public Optional<UUID> validarTokenDesafio(String token) {
        return lerPayloadComEscopo(token, ESCOPO_DESAFIO_2FA)
                .map(json -> UUID.fromString(json.get("sub").asString()));
    }

    /**
     * Token de redefinição de senha, emitido depois de nome/email + código do Google Authenticator
     * conferirem. Leva uma "versão" da senha atual (trecho do hash do hash): ao trocar a senha a
     * versão muda e o token deixa de valer, então ele só pode ser usado uma vez.
     */
    public String gerarTokenRedefinicaoSenha(UsuarioEntity usuario){
        long expiration = Instant.now().plusSeconds(EXPIRACAO_REDEFINICAO_SENHA_SEGUNDOS).getEpochSecond();
        String payload = """
                {"sub": "%s", "escopo": "%s", "sv": "%s", "exp": %d }
                """.formatted(usuario.getId().toString(), ESCOPO_REDEFINICAO_SENHA, versaoDaSenha(usuario), expiration);

        return montarToken(payload);
    }

    /** Devolve o id do usuário se o token de redefinição for válido e a senha ainda não tiver sido trocada com ele. */
    public Optional<UUID> validarTokenRedefinicaoSenha(String token) {
        return lerPayloadComEscopo(token, ESCOPO_REDEFINICAO_SENHA)
                .flatMap(json -> usuarioRepository.findById(UUID.fromString(json.get("sub").asString()))
                        .filter(usuario -> json.has("sv") && MessageDigest.isEqual(
                                versaoDaSenha(usuario).getBytes(StandardCharsets.UTF_8),
                                json.get("sv").asString().getBytes(StandardCharsets.UTF_8))))
                .map(UsuarioEntity::getId);
    }

    private String versaoDaSenha(UsuarioEntity usuario){
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(usuario.getSenha().getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hash).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 indisponível.", e);
        }
    }

    private Optional<JsonNode> lerPayloadComEscopo(String token, String escopo) {
        return lerPayloadValido(token)
                .filter(json -> json.has("escopo") && escopo.equals(json.get("escopo").asString()));
    }

    private Optional<JsonNode> lerPayloadValido(String token) {
        try {
            String[] partesDoToken = token.split("\\.");
            String header = partesDoToken[0];
            String payload = partesDoToken[1];
            String assinaturaEsperada = assinar(header + "." + payload);

            if(!MessageDigest.isEqual(
                    assinaturaEsperada.getBytes(StandardCharsets.UTF_8),
                    partesDoToken[2].getBytes(StandardCharsets.UTF_8))){
                return Optional.empty();
            }

            var payloadDecodificado = Base64.getUrlDecoder().decode(payload);
            var payloadString = new String(payloadDecodificado, StandardCharsets.UTF_8);
            JsonNode json = new ObjectMapper().readTree(payloadString);
            long expiraEm = json.get("exp").asLong();
            long epochSecond = Instant.now().getEpochSecond();

            return epochSecond < expiraEm ? Optional.of(json) : Optional.empty();

        }catch (RuntimeException e){
            return Optional.empty();
        }
    }

    public UsuarioEntity getUsuario(String token) {
        String[] partesDoToken = token.split("\\.");
        byte[] payloadDecodificado = Base64.getUrlDecoder().decode(partesDoToken[1]);
        String payload = new String(payloadDecodificado, StandardCharsets.UTF_8);

        ObjectMapper mapper = new ObjectMapper();

        JsonNode json = mapper.readTree(payload);

        String id = json.get("sub").asString();

        var usuario = usuarioRepository.findById(UUID.fromString(id)).orElseThrow(() -> new RuntimeException("Erro ao tentar resolver usuario."));

        return usuario;
    }
}
