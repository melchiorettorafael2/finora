package io.github.melchiorettorafael2.finora_api.dominio.categoria.web.mapper;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaForm;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoriaMapper {

    @Mapping(target = "usuario", ignore = true)
    CategoriaEntity toEntity(CategoriaForm nova);

    CategoriaDetalhes toDetalhes(CategoriaEntity entity);

    // Edição: só nome e ícone; id, status e dono não mudam
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "ativo", ignore = true)
    @Mapping(target = "usuario", ignore = true)
    void update(@MappingTarget CategoriaEntity entity, CategoriaForm dados);
}