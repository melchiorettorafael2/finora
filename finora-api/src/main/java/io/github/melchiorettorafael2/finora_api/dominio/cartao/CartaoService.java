package io.github.melchiorettorafael2.finora_api.dominio.cartao;

import io.github.melchiorettorafael2.finora_api.common.exceptions.RegistroNaoEncontradoException;
import io.github.melchiorettorafael2.finora_api.common.exceptions.ValidationException;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.dto.CartaoDetalhes;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.dto.CartaoForm;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.mapper.CartaoMapper;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoValidator;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class CartaoService {

    @Autowired
    private CartaoValidator validator;
    @Autowired
    private CartaoRepository repository;
    @Autowired
    private CartaoMapper mapper;


    public CartaoDetalhes criar(CartaoForm form) {
        var result = validator.validar(form, null);

        if (result.isInvalido()) {
            throw new ValidationException(result.getCamposInvalidos());
        }
        CartaoEntity entity = mapper.toEntity(form);
        repository.save(entity);
        return mapper.toDetalhes(entity);
    }

    public CartaoDetalhes obterDetalhes(UUID id) {
        return repository.findById(id).map(mapper::toDetalhes).orElseThrow(() -> new RegistroNaoEncontradoException());
    }

    @Transactional
    public void atualizar(UUID id, CartaoForm dadosAtualizacao) {
        var entity = repository.findById(id)
                .orElseThrow(() -> new RegistroNaoEncontradoException());
        var result = validator.validar(dadosAtualizacao, id);

        if(result.isInvalido()){
            throw new ValidationException(result.getCamposInvalidos());
        }

        mapper.update(entity, dadosAtualizacao);
    }

    public Page<CartaoDetalhes> listar(PageRequest pageRequest) {
        return repository.findAll(pageRequest).map(mapper::toDetalhes);

    }
}