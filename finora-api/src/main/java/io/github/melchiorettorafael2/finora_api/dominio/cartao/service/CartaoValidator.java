package io.github.melchiorettorafael2.finora_api.dominio.cartao.service;

import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.persistence.CartaoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoForm;
import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CartaoValidator {

    @Autowired
    CartaoRepository repository;
    @Autowired
    UsuarioLogado usuarioLogado;

    public ValidationResult validar(CartaoForm form, UUID id){

        var result = ValidationResult.novo();
        // Nome único entre os cartões do próprio usuário
        var isListaNaoVazia = !repository.findByNomeAndNotId(form.nome(), id, usuarioLogado.id()).isEmpty();
        if(isListaNaoVazia){
            result.add(new CampoInvalido("nome", "Já existe um cartão com esse nome."));
        }

        return result;

    }

}

