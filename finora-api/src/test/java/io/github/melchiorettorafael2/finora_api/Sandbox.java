package io.github.melchiorettorafael2.finora_api;

import io.github.melchiorettorafael2.finora_api.dominio.cartao.persistence.CartaoRepository;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.BandeiraCartao;
import io.github.melchiorettorafael2.finora_api.dominio.cartao.model.CartaoEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class Sandbox implements CommandLineRunner {

    @Autowired
    private CartaoRepository repository;

    public void salvarCartao(){
        CartaoEntity cartao = new CartaoEntity();
        cartao.setNome("Itau Personalite");
        cartao.setBandeira(BandeiraCartao.AMEX);

        repository.save(cartao);
    }

    @Override
    public void run(String... args) throws Exception {
        //salvarCartao();
    }
}
