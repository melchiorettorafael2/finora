package io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.BandeiraCartao;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

//Data Access Object
public record CartaoForm(
        @NotBlank(message = "Campo obrigatório")
        String nome,
        @NotNull(message = "Campo obrigatório")
        BandeiraCartao bandeira) {

}
