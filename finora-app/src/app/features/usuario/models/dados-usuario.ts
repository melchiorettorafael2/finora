export interface DetalhesUsuario {
    id: string;
    nome: string;
    email: string;
    possuiFoto: boolean;
    doisFatoresAtivo: boolean;
}

export interface StatusDoisFatores {
    ativo: boolean;
}

export interface ConfiguracaoDoisFatores {
    segredo: string;
    otpauthUri: string;
    emissor: string;
    conta: string;
}

export interface DadosUsuarioForm {
    nome: string;
    email: string;
}

export interface AlterarSenhaForm {
    senhaAtual: string;
    novaSenha: string;
}
