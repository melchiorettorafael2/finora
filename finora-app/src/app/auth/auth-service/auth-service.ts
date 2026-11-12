import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import {
  AuthResponse,
  CadastroUsuarioForm,
  RedefinirSenhaForm,
  VerificacaoDoisFatoresForm,
} from '../dados-auth';
import { Observable, tap } from 'rxjs';
import { LoginForm } from '../dados-auth';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';

interface JwtPayload {
  //sub: string;
  exp?: number;
  //iat: number;
  nome?: string;
  //tipo: string;
} 

@Injectable({
  providedIn: 'root',
})
export class AuthService {

  private readonly token_key = 'token_sessao';
  private readonly nome_key = 'nome_usuario_sessao';
  private readonly desafio_key = 'desafio_2fa';
  private logoyutTimer?: ReturnType<typeof setTimeout>;

  // Reativo para o header refletir a troca de nome feita nas configurações
  private readonly nomeUsuarioState = signal(localStorage.getItem(this.nome_key) ?? '');
  readonly nomeUsuario = this.nomeUsuarioState.asReadonly();

  http = inject(HttpClient);
  router = inject(Router);
  baseUrl = 'http://localhost:8080/auth';

  // O 2FA é opcional (ativado em Configurações). Sem ele, login e cadastro já trazem o token de acesso.
  // Com ele, o login devolve doisFatoresPendente + tokenDesafio e a sessão só é salva depois
  // do código do Google Authenticator (verificarDoisFatores)
  login(dados: LoginForm) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signin`, dados)
           .pipe(tap(response => this.tratarRespostaDeEntrada(response)));
  }

  cadastrar(dados: CadastroUsuarioForm) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, dados)
          .pipe(tap(response => this.tratarRespostaDeEntrada(response)));
  }

  private tratarRespostaDeEntrada(response: AuthResponse): void {
    if (response.doisFatoresPendente && response.tokenDesafio) {
      this.iniciarDesafioDoisFatores(response.tokenDesafio);
    } else {
      this.salvarSessao(response);
    }
  }

  /** Usuário que já tem o app configurado: envia o código. */
  verificarDoisFatores(dados: VerificacaoDoisFatoresForm) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/2fa/verificar`, dados)
           .pipe(tap(response => this.salvarSessao(response)));
  }

  /** "Esqueci minha senha": a API envia um link por e-mail (responde igual exista ou não a conta). */
  solicitarRedefinicaoSenha(email: string) : Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/senha/esqueci`, { email });
  }

  /** Grava a nova senha com o token do link do e-mail. Não inicia sessão. */
  redefinirSenha(dados: RedefinirSenhaForm) : Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/senha/redefinir`, dados);
  }

  // ===== Desafio de 2FA pendente (entre a senha e o código do Google Authenticator) =====
  // Fica no sessionStorage: sobrevive a um F5 na tela de verificação, mas some ao fechar a aba.
  // O token não dá acesso à API (só serve em /auth/2fa/*) e expira em 5 min.

  iniciarDesafioDoisFatores(tokenDesafio: string): void {
    sessionStorage.setItem(this.desafio_key, tokenDesafio);
  }

  /** Token do desafio pendente, ou null se não houver ou se já tiver expirado. */
  getDesafioDoisFatores(): string | null {
    const token = sessionStorage.getItem(this.desafio_key);
    if (!token) {
      return null;
    }
    try {
      const { exp } = jwtDecode<JwtPayload>(token);
      if (exp && Date.now() < exp * 1000) {
        return token;
      }
    } catch {
      // token corrompido: trata como inexistente
    }
    this.limparDesafioDoisFatores();
    return null;
  }

  limparDesafioDoisFatores(): void {
    sessionStorage.removeItem(this.desafio_key);
    sessionStorage.removeItem('desafio_2fa_modo'); // chave de versões anteriores
  }

  salvarSessao(response: AuthResponse) {
    const token = response.token;
    this.limparDesafioDoisFatores(); // a sessão começou: desafio pendente não serve mais
    localStorage.setItem(this.token_key, token);
    localStorage.setItem(this.nome_key, response.nome);
    this.nomeUsuarioState.set(response.nome);
    this.agendarLogoutPorExpiracao();
  }

  iniciarSessao(){

    if(this.isTokenExpired()){
      this.logout(false);
      return;
    }
    this.agendarLogoutPorExpiracao();
  }

  getNomeUsuario(): string {
    return localStorage.getItem(this.nome_key) ?? '';
  }

  getToken():  string | null {
    return localStorage.getItem(this.token_key);
  }

  isAuthenticated(): boolean {
    if(!this.getToken()){
      return false;
    }
    return !this.isTokenExpired();  
  }

  isTokenExpired(): boolean {
    const exp = this.getTokenExpiration();
    if(!exp){
      return true;
    }
    return Date.now() >= exp * 1000; // Convertendo para milissegundos
  }

  logout(redirecionar = true): void {
    localStorage.removeItem(this.token_key);
    localStorage.removeItem(this.nome_key);
    this.nomeUsuarioState.set('');
    if(this.logoyutTimer){
      clearTimeout(this.logoyutTimer);
    }
    if(redirecionar){
      this.router.navigate(['/login']);
    }
  } 

  agendarLogoutPorExpiracao(): void {
    const exp = this.getTokenExpiration(); 
    if(!exp){
      return;
    }
    const tempoRestante = exp * 1000 - Date.now(); // Convertendo para milissegundos
    // A sessão pode ser renovada (ex.: ao editar os dados do usuário), então descarta o timer anterior
    if(this.logoyutTimer){
      clearTimeout(this.logoyutTimer);
    }
    this.logoyutTimer = setTimeout(() => {
      this.logout();
    }, tempoRestante);
  }

  getTokenExpiration(): number | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payload = jwtDecode<JwtPayload>(token);
      if (!payload.exp) {
        return null;
      }
      return payload.exp;

    } catch (error) {
      return null;
    }
  }

}
