package io.github.melchiorettorafael2.finora_api.dominio.lancamento.repository;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.LancamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import org.springframework.cglib.core.Local;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface LancamentoRepository extends JpaRepository<LancamentoEntity, UUID>, JpaSpecificationExecutor<LancamentoEntity> {

    //JPQL
    @Query("""
        select coalesce(sum(l.valor), 0)
        from LancamentoEntity as l
        where l.tipo = :tipo 
        and l.data between :inicio and :fim
""")
    BigDecimal somaPorTipoPeriodo(
            @Param("tipo")TipoLancamento tipoLancamento,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);

    @Query("""
        select l.categoria.nome, coalesce(sum(l.valor),0)
        from LancamentoEntity as l
        where l.tipo = :tipo
        and l.data between :inicio and :fim
        group by l.categoria.nome
        order by sum(l.valor) desc
""")
    List<Object[]> somaPorCategoriaNoPeriodo(
            @Param("tipo")TipoLancamento tipoLancamento,
            @Param("inicio") LocalDate inicio,
            @Param("fim") LocalDate fim);
}
