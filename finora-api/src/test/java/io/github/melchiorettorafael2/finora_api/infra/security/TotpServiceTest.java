package io.github.melchiorettorafael2.finora_api.infra.security;

import org.junit.jupiter.api.Test;

import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.OptionalLong;

import static org.junit.jupiter.api.Assertions.*;

class TotpServiceTest {

    // Segredo dos vetores de teste da RFC 6238 (apêndice B) para SHA1
    private static final byte[] SEGREDO_RFC = "12345678901234567890".getBytes(StandardCharsets.US_ASCII);

    private TotpService servicoNoInstante(long epochSegundos) {
        return new TotpService(Clock.fixed(Instant.ofEpochSecond(epochSegundos), ZoneOffset.UTC));
    }

    @Test
    void geraCodigosDosVetoresDaRfc6238() {
        TotpService totp = new TotpService();
        // A RFC lista 8 dígitos; com 6 dígitos valem os 6 últimos
        assertEquals("287082", totp.gerarCodigo(SEGREDO_RFC, 59L / 30));
        assertEquals("081804", totp.gerarCodigo(SEGREDO_RFC, 1111111109L / 30));
        assertEquals("050471", totp.gerarCodigo(SEGREDO_RFC, 1111111111L / 30));
        assertEquals("005924", totp.gerarCodigo(SEGREDO_RFC, 1234567890L / 30));
        assertEquals("279037", totp.gerarCodigo(SEGREDO_RFC, 2000000000L / 30));
    }

    @Test
    void base32IdaEVolta() {
        String codificado = TotpService.base32Encode(SEGREDO_RFC);
        assertEquals("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", codificado);
        assertArrayEquals(SEGREDO_RFC, TotpService.base32Decode(codificado));
        assertArrayEquals(SEGREDO_RFC, TotpService.base32Decode("gezd gnbv gy3t qojq gezd gnbv gy3t qojq"));
    }

    @Test
    void validaCodigoAtualEToleraUmPassoDeDiferenca() {
        String segredo = TotpService.base32Encode(SEGREDO_RFC);
        TotpService totp = servicoNoInstante(1111111111L);

        assertEquals(OptionalLong.of(1111111111L / 30), totp.validar(segredo, "050471", null));
        // Código do passo anterior ainda é aceito
        assertTrue(totp.validar(segredo, "081804", null).isPresent());
        assertTrue(totp.validar(segredo, "000000", null).isEmpty());
        assertTrue(totp.validar(segredo, "12345", null).isEmpty());
        assertTrue(totp.validar(segredo, null, null).isEmpty());
    }

    @Test
    void recusaCodigoJaUtilizado() {
        String segredo = TotpService.base32Encode(SEGREDO_RFC);
        TotpService totp = servicoNoInstante(1111111111L);
        long passoUsado = totp.validar(segredo, "050471", null).orElseThrow();

        assertTrue(totp.validar(segredo, "050471", passoUsado).isEmpty());
    }

    @Test
    void geraSegredoEUriNoFormatoDoGoogleAuthenticator() {
        TotpService totp = new TotpService();
        String segredo = totp.gerarSegredo();

        assertEquals(32, segredo.length()); // 20 bytes em Base32
        assertTrue(segredo.matches("[A-Z2-7]+"));
        assertEquals(
                "otpauth://totp/Finora%3Ausuario%40email.com?secret=" + segredo
                        + "&issuer=Finora&algorithm=SHA1&digits=6&period=30",
                totp.gerarUri(segredo, "usuario@email.com"));
    }
}
