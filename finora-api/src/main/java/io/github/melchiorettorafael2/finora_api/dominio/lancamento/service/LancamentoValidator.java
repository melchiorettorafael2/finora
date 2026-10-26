package io.github.melchiorettorafael2.finora_api.dominio.lancamento.service;

import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.model.TipoLancamento;
import io.github.melchiorettorafael2.finora_api.dominio.lancamento.web.dto.LancamentoForm;
import org.springframework.stereotype.Component;

@Component
public class LancamentoValidator {

    public ValidationResult validar(LancamentoForm form, CategoriaEntity categoria, CartaoEntity cartao){
        var result = ValidationResult.novo();

        if(categoria == null){
            result.add(new CampoInvalido("categoriaId", "Categoria não encontrada."));
        }else if(Boolean.FALSE.equals(categoria.getAtivo())){
            result.add(new CampoInvalido("categoriaId", "Categoria inativa."));
        }

        if(form.tipo() == TipoLancamento.RECEITA && cartao!= null){
            result.add(new CampoInvalido("cartaoId", "Lançamento do tipo RECEITA não aceita cartão."));
        }

        if(form.tipo() == TipoLancamento.DESPESA && form.cartaoId() != null){
            if(cartao == null ){
                result.add(new CampoInvalido("cartaoId", "Cartao não encontrado!"));
            }else if(Boolean.FALSE.equals(cartao.getAtivo())){
                result.add(new CampoInvalido("cartaoId", "Cartao inativo!"));
            }
        }

        return result;
    }

}

