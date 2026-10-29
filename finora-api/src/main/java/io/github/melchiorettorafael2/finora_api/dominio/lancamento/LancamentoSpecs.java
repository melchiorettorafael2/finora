package io.github.melchiorettorafael2.finora_api.dominio.lancamento;

import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.LancamentoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.UUID;

public class LancamentoSpecs {

    private LancamentoSpecs(){

    }

    public static Specification<LancamentoEntity> tipoEqual(TipoLancamento tipo){
        return (root, query, cb) ->{
            return cb.equal(root.get("tipo"), tipo);
        };
    }

    public static Specification<LancamentoEntity> categoriaEqual(UUID categoriaId){
        return (root, query, cb) ->{
            return cb.equal(root.get("categoria").get("id"), categoriaId);
        };
    }


    public static Specification<LancamentoEntity> mesEqual(YearMonth mes){
        return (root, query, cb) ->{
            LocalDate inicioMes = mes.atDay(1);
            LocalDate fimMes = mes.atEndOfMonth();

            return cb.between(root.get("data"), inicioMes, fimMes);
        };
    }



}
