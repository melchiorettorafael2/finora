package io.github.melchiorettorafael2.finora_api.dominio.planejamento.service;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.repository.MetaEconomiaRepository;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.MetaEconomiaDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.dto.MetaEconomiaForm;
import io.github.melchiorettorafael2.finora_api.dominio.planejamento.web.mapper.MetaEconomiaMapper;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class MetaEconomiaService {

    @Autowired
    private MetaEconomiaRepository repository;
    @Autowired
    private MetaEconomiaMapper mapper;

    public MetaEconomiaDetalhes criar(MetaEconomiaForm form) {
        var entity = mapper.toEntity(form);
        repository.save(entity);
        return mapper.toDetalhes(entity);
    }

    public List<MetaEconomiaDetalhes> listar() {
        return repository.findAllByOrderByPrazoAsc().stream().map(mapper::toDetalhes).toList();
    }

    public MetaEconomiaDetalhes buscar(UUID id) {
        return repository.findById(id)
                .map(mapper::toDetalhes)
                .orElseThrow(RegistroNaoEncontradoException::new);
    }

    @Transactional
    public MetaEconomiaDetalhes atualizar(UUID id, MetaEconomiaForm form) {
        var entity = repository.findById(id).orElseThrow(RegistroNaoEncontradoException::new);
        mapper.atualizar(form, entity);
        repository.save(entity);
        return mapper.toDetalhes(entity);
    }

    public void remover(UUID id) {
        var entity = repository.findById(id).orElseThrow(RegistroNaoEncontradoException::new);
        repository.delete(entity);
    }
}
