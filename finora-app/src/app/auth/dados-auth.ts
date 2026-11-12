export class LoginForm {
    login!: string;
    senha!: string;
}

export class CadastroUsuarioForm {
    nome!: string;
    login!: string;
    senha!: string;
}

export class AuthResponse{
    token!: string;
    tipo!: string;
    expiraEm!: number;
    nome!: string;
    // Só com o 2FA ativo (opcional, em Configurações): o login vem sem token de acesso, só com o desafio
    doisFatoresPendente?: boolean;
    tokenDesafio?: string;
}

// "Esqueci minha senha", 1ª etapa: confirma a identidade com o Google Authenticator
export interface VerificarIdentidadeForm {
    login: string;
    codigo: string;
}

export interface TokenRedefinicaoSenha {
    tokenRedefinicao: string;
    expiraEm: number;
}

// 2ª etapa: nova senha com o token da 1ª
export interface RedefinirSenhaForm {
    tokenRedefinicao: string;
    novaSenha: string;
}

export interface VerificacaoDoisFatoresForm {
    tokenDesafio: string;
    codigo: string;
}
