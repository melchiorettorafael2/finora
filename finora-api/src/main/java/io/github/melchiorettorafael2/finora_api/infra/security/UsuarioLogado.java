package io.github.melchiorettorafael2.finora_api.infra.security;

import io.github.melchiorettorafael2.finora_api.common.exceptions.UnauthorizedException;
import io.github.melchiorettorafael2.finora_api.dominio.usuario.model.UsuarioEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.UUID;

/**
 * Usuário dono da requisição atual (definido pelo {@link AuthInterceptor} a partir do token).
 * Os services usam este componente para gravar e consultar somente os dados do próprio usuário.
 */
@Component
public class UsuarioLogado {

    public UsuarioEntity get() {
        RequestAttributes atributos = RequestContextHolder.getRequestAttributes();
        Object usuario = atributos == null ? null : atributos.getAttribute("usuario", RequestAttributes.SCOPE_REQUEST);

        if (!(usuario instanceof UsuarioEntity entity)) {
            throw new UnauthorizedException("Usuário não autenticado.");
        }
        return entity;
    }

    public UUID id() {
        return get().getId();
    }
}
