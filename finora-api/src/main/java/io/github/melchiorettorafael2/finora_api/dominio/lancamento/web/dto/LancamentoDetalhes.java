package io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;

import java.math.BigDecimal;
import java.time.LocalDate;

public record LancamentoDetalhes(
        String id,
        LocalDate data,
        BigDecimal valor,
        TipoLancamento tipo,
        String categoriaId,
        String categoriaNome,
        String cartaoId,
        String cartaoNome,
        String descricao
) {
}
