package io.github.melchiorettorafael2.finora_api.common.exceptions;

/** Operação válida no formato, mas barrada por uma regra do sistema (responde 409 com a mensagem para o usuário). */
public class RegraNegocioException extends RuntimeException {
    public RegraNegocioException(String message) {
        super(message);
    }
}
