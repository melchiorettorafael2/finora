package io.github.melchiorettorafael2.finora_api.dominio.categoria.service;

import io.github.melchiorettorafael2.finora_api.common.validation.CampoInvalido;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.repository.CategoriaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaForm;
import io.github.melchiorettorafael2.finora_api.infra.security.UsuarioLogado;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
public class CategoriaValidator {

    @Autowired
    private CategoriaRepository repository;

    @Autowired
    private UsuarioLogado usuarioLogado;

    public ValidationResult validar(CategoriaForm nova) {
        return validar(nova, null);
    }

    /** @param id categoria em edição (null no cadastro) */
    public ValidationResult validar(CategoriaForm nova, UUID id) {

        var result = ValidationResult.novo();

        // Nome único entre as categorias do próprio usuário
        var existeCategoriaCadastrada = id == null
                ? repository.existsByNomeAndUsuarioId(nova.nome(), usuarioLogado.id())
                : repository.existsByNomeAndUsuarioIdAndIdNot(nova.nome(), usuarioLogado.id(), id);

        if(existeCategoriaCadastrada){
            result.add(new CampoInvalido("nome","Já existe uma categoria com esse nome."));
        }

        return result;
    }
}
