package io.github.melchiorettorafael2.finora_api.infra.security;

import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Um código de 6 dígitos tem só 1 milhão de combinações: sem limite, daria para testar todas.
 * Bloqueia o usuário por alguns minutos após várias falhas seguidas.
 * Fica em memória, então zera ao reiniciar a API (suficiente para uma instância única).
 */
@Component
public class LimiteTentativasDoisFatores {

    private static final int MAXIMO_FALHAS = 5;
    private static final Duration JANELA = Duration.ofMinutes(5);

    private record Registro(int falhas, Instant inicio) {
        boolean expirado() {
            return Instant.now().isAfter(inicio.plus(JANELA));
        }
    }

    private final ConcurrentHashMap<UUID, Registro> registros = new ConcurrentHashMap<>();

    public boolean isBloqueado(UUID usuarioId) {
        Registro registro = registros.get(usuarioId);
        if (registro == null) {
            return false;
        }
        if (registro.expirado()) {
            registros.remove(usuarioId, registro);
            return false;
        }
        return registro.falhas() >= MAXIMO_FALHAS;
    }

    public void registrarFalha(UUID usuarioId) {
        registros.compute(usuarioId, (id, registro) ->
                registro == null || registro.expirado()
                        ? new Registro(1, Instant.now())
                        : new Registro(registro.falhas() + 1, registro.inicio()));
    }

    public void limpar(UUID usuarioId) {
        registros.remove(usuarioId);
    }
}
