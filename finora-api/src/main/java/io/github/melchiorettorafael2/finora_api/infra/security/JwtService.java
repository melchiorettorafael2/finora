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
import java.util.UUID;

@Service
public class JwtService {

    private static final String ALGORITMO = "HmacSHA256";
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
        String header = base64Url("""
                {"alg": "HS256", "type": "JWT"}
                """);

        String payload = base64Url("""
                {"sub": "%s", "nome": "%s", "exp": %d }
                """.formatted(usuario.getId().toString(), usuario.getNome(), expiration));

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

    public boolean isTokenValido(String token) {
        try {
            String[] partesDoToken = token.split("\\.");
            String header = partesDoToken[0];
            String payload = partesDoToken[1];
            String assinaturaEsperada = assinar(header + "." + payload);

            if(!MessageDigest.isEqual(
                    assinaturaEsperada.getBytes(StandardCharsets.UTF_8),
                    partesDoToken[2].getBytes(StandardCharsets.UTF_8))){
                return false;
            }

            var payloadDecodificado = Base64.getUrlDecoder().decode(payload);
            var payloadString = new String(payloadDecodificado, StandardCharsets.UTF_8);
            ObjectMapper objectMapper = new ObjectMapper();
            JsonNode json = objectMapper.readTree(payloadString);
            long expiraEm = json.get("exp").asLong();
            long epochSecond = Instant.now().getEpochSecond();

            return epochSecond < expiraEm;

        }catch (RuntimeException e){
            return false;
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
