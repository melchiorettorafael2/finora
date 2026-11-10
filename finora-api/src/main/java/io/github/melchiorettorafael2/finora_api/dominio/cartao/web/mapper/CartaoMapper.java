package io.github.melchiorettorafael2.finora_api.dominio.cartao.web.mapper;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoForm;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CartaoMapper {


    @Mapping(target = "usuario", ignore = true)
    CartaoEntity toEntity(CartaoForm form);

    CartaoDetalhes toDetalhes(CartaoEntity entity);

    @Mapping(target = "usuario", ignore = true)
    void update(@MappingTarget CartaoEntity entity, CartaoForm dadosAtualizacao);

}
