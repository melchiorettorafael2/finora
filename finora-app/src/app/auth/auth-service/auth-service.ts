import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthResponse, CadastroUsuarioForm } from '../dados-auth';
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
  private logoyutTimer?: ReturnType<typeof setTimeout>;

  http = inject(HttpClient);
  router = inject(Router);
  baseUrl = 'http://localhost:8080/auth';

  login(dados: LoginForm) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signin`, dados)
           .pipe(tap(response => this.salvarSessao(response)));
  }

  cadastrar(dados: CadastroUsuarioForm) : Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/signup`, dados)
          .pipe(tap(response => this.salvarSessao(response)));

  }

  salvarSessao(response: AuthResponse) {
    const token = response.token;
    localStorage.setItem(this.token_key, token);
    localStorage.setItem(this.nome_key, response.nome);
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
