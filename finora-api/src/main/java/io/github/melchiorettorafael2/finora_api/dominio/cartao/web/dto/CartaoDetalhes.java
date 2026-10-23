package io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.BandeiraCartao;

import java.time.LocalDateTime;

public record CartaoDetalhes(
        String id,
        String nome,
        BandeiraCartao bandeira,
        LocalDateTime dataCadastro,
        Boolean ativo) {
}
