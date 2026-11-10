package io.github.melchiorettorafael2.finora_api.dominio.planejamento.service;

import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;
import org.springframework.stereotype.Component;

@Component
public class PlanejamentoValidator {

    /** Orçamentos e contas previstas só podem usar categorias existentes e ativas. */
    public ValidationResult validarCategoria(CategoriaEntity categoria) {
        var result = ValidationResult.novo();

        if (categoria == null) {
            result.add(new CampoInvalido("categoriaId", "Categoria não encontrada."));
        } else if (Boolean.FALSE.equals(categoria.getAtivo())) {
            result.add(new CampoInvalido("categoriaId", "Categoria inativa."));
        }

        return result;
    }
}
