package io.github.melchiorettorafael2.finora_api.common.validation;

import java.util.ArrayList;
import java.util.List;

public class ValidationResult {

    private List<CampoInvalido> camposInvalidos;

    private ValidationResult(List<CampoInvalido> camposInvalidos) {
        this.camposInvalidos = camposInvalidos;
    }

    public static ValidationResult novo() {
        return new ValidationResult(new ArrayList<>());
    }

    public void add(CampoInvalido campoInvalido){
        this.camposInvalidos.add(campoInvalido);
    }

    public List<CampoInvalido> getCamposInvalidos(){
        return camposInvalidos;
    }

    public boolean isInvalido(){
        return !camposInvalidos.isEmpty();
    }
}
