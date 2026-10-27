package io.github.melchiorettorafael2.finora_api.dominio.categoria.service;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.validation.ValidationResult;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.repository.CategoriaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.dto.CategoriaForm;
import io.github.melchiorettorafael2.finora_api.dominio.categoria.model.CategoriaEntity;

import io.github.melchiorettorafael2.finora_api.dominio.categoria.web.mapper.CategoriaMapper;
import jakarta.transaction.Transactional;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class CategoriaService {

    @Autowired
    private CategoriaValidator validator;

    @Autowired
    private CategoriaMapper mapper;

    @Autowired
    private CategoriaRepository repository;


    public CategoriaDetalhes criar(CategoriaForm nova) {
        ValidationResult result = validator.validar(nova);

        if(result.isInvalido()){
            throw new ValidationException(result.getCamposInvalidos());
        }

        CategoriaEntity entity = mapper.toEntity(nova);
        repository.save(entity);

        return mapper.toDetalhes(entity);
    }

    public Page<CategoriaDetalhes> listar(PageRequest pageRequest) {
        return repository
                .findAll(pageRequest)
                .map(mapper::toDetalhes);
    }

    @Transactional
    public void mudarStatus(UUID id) {
        var categoria = repository.findById(id).orElseThrow(RegistroNaoEncontradoException::new);

        categoria.setAtivo(!categoria.getAtivo());
        repository.save(categoria);
    }

    public List<CategoriaDetalhes> listarAtivas() {
        return repository.findByAtivoTrue().stream().map(mapper::toDetalhes).toList();
    }
}
