package io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository;

import io.github.melchiorettorafael2.finora_api.dominio.planejamento.model.MetaEconomiaEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MetaEconomiaRepository extends JpaRepository<MetaEconomiaEntity, UUID> {

    List<MetaEconomiaEntity> findAllByOrderByPrazoAsc();
}
