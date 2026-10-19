package io.github.melchiorettorafael2.finora_api.dominio.cartao.model;

import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.CartaoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.dto.CartaoForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CartaoValidator {

    @Autowired
    CartaoRepository repository;

    public ValidationResult validar(CartaoForm form, UUID id){

        var result = ValidationResult.novo();
        var isListaNaoVazia = !repository.findByNomeAndNotId(form.nome(), id).isEmpty();
        if(isListaNaoVazia){
            result.add(new CampoInvalido("nome", "Já cadastrado!"));
        }

        return result;

    }

}

