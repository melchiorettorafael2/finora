package io.github.melchiorettorafael2.finora_api.dominio.cartao.web.mapper;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.web.dto.CartaoForm;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CartaoMapper {


    CartaoEntity toEntity(CartaoForm form);

    CartaoDetalhes toDetalhes(CartaoEntity entity);

    void update(@MappingTarget CartaoEntity entity, CartaoForm dadosAtualizacao);

}
