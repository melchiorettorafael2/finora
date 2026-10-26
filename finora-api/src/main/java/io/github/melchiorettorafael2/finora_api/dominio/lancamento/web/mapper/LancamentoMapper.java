package io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.mapper;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.LancamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoForm;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface LancamentoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "categoria", source = "categoria")
    @Mapping(target = "cartao", source = "cartao")
    LancamentoEntity toEntity(LancamentoForm form, CategoriaEntity categoria, CartaoEntity cartao);

    @Mapping(target = "categoriaId", source = "categoria.id")
    @Mapping(target = "categoriaNome", source = "categoria.nome")
    @Mapping(target = "cartaoId", source = "cartao.id")
    @Mapping(target = "cartaoNome", source = "cartao.nome")
    LancamentoDetalhes toDetalhes(LancamentoEntity entity);
}
