import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { DetalhesCategoria } from '../../categorias/models/dados-categoria';
import {
  MetaEconomia,
  MetaEconomiaForm,
  OrcamentoForm,
  Planejamento,
} from '../models/dados-planejamento';

@Injectable({
  providedIn: 'root',
})
export class PlanejamentoService {

  http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/planejamento';

  obterPlanejamento(mes: string): Observable<Planejamento> {
    return this.http.get<Planejamento>(this.baseUrl, { params: new HttpParams().set('mes', mes) });
  }

  listarCategoriasDisponiveis(): Observable<DetalhesCategoria[]> {
    return this.http.get<DetalhesCategoria[]>(`${this.baseUrl}/categorias-disponiveis`);
  }

  // ===== Orçamentos (um por categoria: o PUT cria ou atualiza) =====

  definirOrcamento(dados: OrcamentoForm): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/orcamentos`, dados);
  }

  removerOrcamento(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/orcamentos/${id}`);
  }

  // ===== Metas =====

  criarMeta(dados: MetaEconomiaForm): Observable<MetaEconomia> {
    return this.http.post<MetaEconomia>(`${this.baseUrl}/metas`, dados);
  }

  buscarMeta(id: string): Observable<MetaEconomia> {
    return this.http.get<MetaEconomia>(`${this.baseUrl}/metas/${id}`);
  }

  atualizarMeta(id: string, dados: MetaEconomiaForm): Observable<MetaEconomia> {
    return this.http.put<MetaEconomia>(`${this.baseUrl}/metas/${id}`, dados);
  }

  removerMeta(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/metas/${id}`);
  }
}
