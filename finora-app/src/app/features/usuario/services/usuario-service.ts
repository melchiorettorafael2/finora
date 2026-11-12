import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { AuthService } from '../../../auth/auth-service/auth-service';
import { AuthResponse } from '../../../auth/dados-auth';
import { AlterarSenhaForm, DadosUsuarioForm, DetalhesUsuario } from '../models/dados-usuario';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  baseUrl = `${environment.apiUrl}/usuarios/me`;

  // A foto exige o header Authorization, então não dá para usar a URL direto no <img>:
  // baixa como blob e expõe uma object URL compartilhada entre o header e a página
  private readonly fotoUrlState = signal<string | null>(null);
  readonly fotoUrl = this.fotoUrlState.asReadonly();
  private tokenDaFotoCarregada: string | null = null;

  obterDados(): Observable<DetalhesUsuario> {
    return this.http.get<DetalhesUsuario>(this.baseUrl);
  }

  // A API devolve um novo token, pois o nome do usuário faz parte do JWT
  atualizarDados(dados: DadosUsuarioForm): Observable<AuthResponse> {
    return this.http.put<AuthResponse>(this.baseUrl, dados).pipe(
      tap(response => {
        this.authService.salvarSessao(response);
        // A foto é a mesma, só o token mudou: evita baixar de novo
        this.tokenDaFotoCarregada = response.token;
      })
    );
  }

  alterarSenha(dados: AlterarSenhaForm): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/senha`, dados);
  }

  /** Carrega a foto uma vez por sessão (token); use `forcar` para recarregar. */
  carregarFoto(forcar = false): void {
    const token = this.authService.getToken();
    if (!token || (!forcar && token === this.tokenDaFotoCarregada)) {
      return;
    }

    // Outro usuário entrou: não mostra a foto do anterior enquanto carrega
    if (token !== this.tokenDaFotoCarregada) {
      this.definirFoto(null);
    }
    this.tokenDaFotoCarregada = token;

    this.http.get(`${this.baseUrl}/foto`, { responseType: 'blob', observe: 'response' }).subscribe({
      next: response => this.definirFoto(response.status === 200 ? response.body : null),
      error: () => this.definirFoto(null),
    });
  }

  salvarFoto(arquivo: File): Observable<void> {
    const formData = new FormData();
    formData.append('foto', arquivo);
    return this.http.put<void>(`${this.baseUrl}/foto`, formData).pipe(
      tap(() => this.definirFoto(arquivo))
    );
  }

  removerFoto(): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/foto`).pipe(
      tap(() => this.definirFoto(null))
    );
  }

  private definirFoto(imagem: Blob | null): void {
    const urlAnterior = this.fotoUrlState();
    if (urlAnterior) {
      URL.revokeObjectURL(urlAnterior);
    }
    this.fotoUrlState.set(imagem && imagem.size > 0 ? URL.createObjectURL(imagem) : null);
  }
}
