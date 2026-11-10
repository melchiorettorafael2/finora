package io.github.melchiorettorafael2.finora_api.dominio.planejamento.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "meta_economia")
@Getter
@Setter
public class MetaEconomiaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 100)
    private String nome;

    // Classe do Font Awesome exibida no card (ex.: fa-plane)
    @Column(nullable = false, length = 50)
    private String icone;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal objetivo;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal acumulado;

    @Column(nullable = false)
    private LocalDate prazo;
}
