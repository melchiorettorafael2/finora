package io.github.melchiorettorafael2.finora_api.infra.demo;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegraNegocioException;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/**
 * Conta de demonstração divulgada publicamente (login em app.demo.login / DEMO_LOGIN).
 * Como qualquer pessoa entra nela, o que poderia trancar os outros visitantes fica bloqueado:
 * senha, e-mail, nome, foto, verificação em duas etapas e recuperação de senha.
 * Lançamentos, categorias etc. continuam livres e voltam ao original todo dia (DemoService).
 */
@Component
public class ContaDemo {

    public static final String MENSAGEM = "Não disponível na conta de demonstração.";

    private final String login;

    public ContaDemo(@Value("${app.demo.login:}") String login) {
        this.login = login == null ? "" : login.trim();
    }

    public boolean ativa() {
        return !login.isBlank();
    }

    public String getLogin() {
        return login;
    }

    public boolean ehDemo(UsuarioEntity usuario) {
        return ehDemo(usuario == null ? null : usuario.getLogin());
    }

    public boolean ehDemo(String loginUsuario) {
        return ativa() && loginUsuario != null && login.equalsIgnoreCase(loginUsuario.trim());
    }

    /** Recusa a operação (409, com a mensagem acima) quando o usuário é a conta demo. */
    public void bloquear(UsuarioEntity usuario) {
        if (ehDemo(usuario)) {
            throw new RegraNegocioException(MENSAGEM);
        }
    }
}
