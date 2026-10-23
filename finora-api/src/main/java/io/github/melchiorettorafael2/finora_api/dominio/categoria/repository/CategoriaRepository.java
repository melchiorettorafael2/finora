package io.github.melchiorettorafael2.finora_api.dominio.categoria.repository;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CategoriaRepository extends JpaRepository<CategoriaEntity, UUID> {
    boolean existsByNome(String nome);
}
