package io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LancamentoRepository extends JpaRepository<LancamentoRepository, UUID> {
}
