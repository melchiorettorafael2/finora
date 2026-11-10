package io.github.melchiorettorafael2.finora_api.dominio.planejamento.model;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Limite mensal de gastos de uma categoria. É recorrente: vale para todos os meses,
 * e o gasto é calculado a partir dos lançamentos do mês consultado.
 */
@Entity
@Table(name = "orcamento", uniqueConstraints = @UniqueConstraint(columnNames = "categoria_id"))
@Getter
@Setter
public class OrcamentoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private CategoriaEntity categoria;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal limite;
}
