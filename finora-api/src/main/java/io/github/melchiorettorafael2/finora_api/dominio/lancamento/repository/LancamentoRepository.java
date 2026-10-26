package io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.LancamentoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

public interface LancamentoRepository extends JpaRepository<LancamentoEntity, UUID> {
}
