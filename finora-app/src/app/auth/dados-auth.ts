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
    // 2FA obrigatório: login/cadastro vêm sem token de acesso, só com o desafio
    doisFatoresPendente?: boolean;
    // true no primeiro acesso: precisa escanear o QR code antes de digitar o código
    configuracaoDoisFatoresPendente?: boolean;
    tokenDesafio?: string;
}

export interface VerificacaoDoisFatoresForm {
    tokenDesafio: string;
    codigo: string;
}
