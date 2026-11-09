package io.github.melchiorettorafael2.finora_api.infra.security;

import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayOutputStream;
import java.net.URLEncoder;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.Clock;
import java.util.Locale;
import java.util.OptionalLong;

/**
 * TOTP (RFC 6238), o algoritmo usado pelo Google Authenticator, Microsoft Authenticator, Authy etc.:
 * HMAC-SHA1 de um segredo compartilhado sobre o "passo" de tempo atual (blocos de 30s), truncado em 6 dígitos.
 */
@Service
public class TotpService {

    public static final String EMISSOR = "Finora";
    private static final int DIGITOS = 6;
    private static final int PERIODO_SEGUNDOS = 30;
    // Aceita o passo anterior e o seguinte para tolerar relógios um pouco fora de sincronia
    private static final int JANELA_PASSOS = 1;
    private static final int TAMANHO_SEGREDO_BYTES = 20; // 160 bits, o recomendado para SHA1
    private static final String ALFABETO_BASE32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    private final SecureRandom random = new SecureRandom();
    private final Clock clock;

    public TotpService() {
        this(Clock.systemUTC());
    }

    // Permite fixar o relógio nos testes
    TotpService(Clock clock) {
        this.clock = clock;
    }

    public String gerarSegredo() {
        byte[] bytes = new byte[TAMANHO_SEGREDO_BYTES];
        random.nextBytes(bytes);
        return base32Encode(bytes);
    }

    /** URI lida pelo app autenticador ao escanear o QR code. */
    public String gerarUri(String segredo, String conta) {
        String rotulo = codificar(EMISSOR + ":" + conta);
        return "otpauth://totp/" + rotulo
                + "?secret=" + segredo
                + "&issuer=" + codificar(EMISSOR)
                + "&algorithm=SHA1&digits=" + DIGITOS
                + "&period=" + PERIODO_SEGUNDOS;
    }

    /**
     * Valida o código e devolve o passo de tempo a que ele corresponde.
     * Passos menores ou iguais a {@code ultimoPassoUsado} são recusados, para que um código
     * já usado não possa ser reaproveitado (proteção contra replay).
     */
    public OptionalLong validar(String segredo, String codigo, Long ultimoPassoUsado) {
        if (segredo == null || codigo == null || !codigo.matches("\\d{" + DIGITOS + "}")) {
            return OptionalLong.empty();
        }

        byte[] chave = base32Decode(segredo);
        long passoAtual = clock.instant().getEpochSecond() / PERIODO_SEGUNDOS;

        for (int deslocamento = -JANELA_PASSOS; deslocamento <= JANELA_PASSOS; deslocamento++) {
            long passo = passoAtual + deslocamento;
            if (ultimoPassoUsado != null && passo <= ultimoPassoUsado) {
                continue;
            }
            String esperado = gerarCodigo(chave, passo);
            if (MessageDigest.isEqual(esperado.getBytes(StandardCharsets.US_ASCII), codigo.getBytes(StandardCharsets.US_ASCII))) {
                return OptionalLong.of(passo);
            }
        }
        return OptionalLong.empty();
    }

    String gerarCodigo(byte[] chave, long passo) {
        try {
            Mac mac = Mac.getInstance("HmacSHA1");
            mac.init(new SecretKeySpec(chave, "HmacSHA1"));
            byte[] hash = mac.doFinal(ByteBuffer.allocate(Long.BYTES).putLong(passo).array());

            // Truncamento dinâmico (RFC 4226, seção 5.3)
            int offset = hash[hash.length - 1] & 0x0f;
            int binario = ((hash[offset] & 0x7f) << 24)
                    | ((hash[offset + 1] & 0xff) << 16)
                    | ((hash[offset + 2] & 0xff) << 8)
                    | (hash[offset + 3] & 0xff);

            int otp = binario % (int) Math.pow(10, DIGITOS);
            return String.format("%0" + DIGITOS + "d", otp);
        } catch (GeneralSecurityException e) {
            throw new IllegalStateException("Erro ao gerar código TOTP.", e);
        }
    }

    private static String codificar(String valor) {
        // URLEncoder usa "+" para espaço; na URI otpauth o correto é %20
        return URLEncoder.encode(valor, StandardCharsets.UTF_8).replace("+", "%20");
    }

    // ===== Base32 (RFC 4648, sem padding), formato do segredo nos apps autenticadores =====

    static String base32Encode(byte[] dados) {
        StringBuilder resultado = new StringBuilder((dados.length * 8 + 4) / 5);
        int buffer = 0;
        int bitsNoBuffer = 0;
        for (byte b : dados) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsNoBuffer += 8;
            while (bitsNoBuffer >= 5) {
                resultado.append(ALFABETO_BASE32.charAt((buffer >> (bitsNoBuffer - 5)) & 0x1f));
                bitsNoBuffer -= 5;
            }
        }
        if (bitsNoBuffer > 0) {
            resultado.append(ALFABETO_BASE32.charAt((buffer << (5 - bitsNoBuffer)) & 0x1f));
        }
        return resultado.toString();
    }

    static byte[] base32Decode(String texto) {
        String normalizado = texto.replace("=", "").replace(" ", "").toUpperCase(Locale.ROOT);
        ByteArrayOutputStream saida = new ByteArrayOutputStream(normalizado.length() * 5 / 8);
        int buffer = 0;
        int bitsNoBuffer = 0;
        for (char c : normalizado.toCharArray()) {
            int valor = ALFABETO_BASE32.indexOf(c);
            if (valor < 0) {
                throw new IllegalArgumentException("Caractere Base32 inválido: " + c);
            }
            buffer = (buffer << 5) | valor;
            bitsNoBuffer += 5;
            if (bitsNoBuffer >= 8) {
                saida.write((buffer >> (bitsNoBuffer - 8)) & 0xff);
                bitsNoBuffer -= 8;
            }
        }
        return saida.toByteArray();
    }
}
