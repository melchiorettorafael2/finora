import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ConfiguracaoDoisFatores, StatusDoisFatores } from '../models/dados-usuario';

@Injectable({
  providedIn: 'root',
})
export class DoisFatoresService {
  private http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/usuarios/me/2fa';

  status(): Observable<StatusDoisFatores> {
    return this.http.get<StatusDoisFatores>(this.baseUrl);
  }

  /** Gera um novo segredo (pendente até ser confirmado em ativar). */
  configurar(): Observable<ConfiguracaoDoisFatores> {
    return this.http.post<ConfiguracaoDoisFatores>(`${this.baseUrl}/configurar`, null);
  }

  ativar(codigo: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/ativar`, { codigo });
  }

  desativar(codigo: string): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/desativar`, { codigo });
  }
}
