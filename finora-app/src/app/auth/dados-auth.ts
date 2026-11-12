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

// "Esqueci minha senha": nova senha com o token do link enviado por e-mail
export interface RedefinirSenhaForm {
    tokenRedefinicao: string;
    novaSenha: string;
}

export interface VerificacaoDoisFatoresForm {
    tokenDesafio: string;
    codigo: string;
}
