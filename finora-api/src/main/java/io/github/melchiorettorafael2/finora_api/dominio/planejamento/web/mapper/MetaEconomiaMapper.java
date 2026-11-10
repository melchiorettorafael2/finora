package io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.mapper;

import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.MetaEconomiaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.MetaEconomiaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.MetaEconomiaForm;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface MetaEconomiaMapper {

    @Mapping(target = "id", ignore = true)
    MetaEconomiaEntity toEntity(MetaEconomiaForm form);

    @Mapping(target = "id", ignore = true)
    void atualizar(MetaEconomiaForm form, @MappingTarget MetaEconomiaEntity entity);

    MetaEconomiaDetalhes toDetalhes(MetaEconomiaEntity entity);
}
