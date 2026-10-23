package io.github.melchiorettorafael2.finora_api.dominio.categoria.service;

import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.repository.CategoriaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaForm;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CategoriaValidator {

    @Autowired
    private CategoriaRepository repository;

    public ValidationResult validar(CategoriaForm nova) {

        var result = ValidationResult.novo();

        var existeCategoriaCadastrada = repository.existsByNome(nova.nome());

        if(existeCategoriaCadastrada){
            result.add(new CampoInvalido("nome","Já existe uma Categoria cadastrada com esse nome!"));
        }

        return result;
    }
}
