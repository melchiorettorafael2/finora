export interface DetalhesUsuario {
    id: string;
    nome: string;
    email: string;
    possuiFoto: boolean;
}

export interface DadosUsuarioForm {
    nome: string;
    email: string;
}

export interface AlterarSenhaForm {
    senhaAtual: string;
    novaSenha: string;
}
