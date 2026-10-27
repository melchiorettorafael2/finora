import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { DadosLancamentos, DetalhesLancamento} from './dados-lancamentos';
import { Observable } from 'rxjs';
import { DetalhesCategoria } from '../features/categorias/models/dados-categoria';
import { DetalhesCartao } from '../features/cartoes/models/dados-cartao';




@Injectable({
  providedIn: 'root',
})
export class LancamentoService {

  http = inject(HttpClient);
  baseUrl = 'http://localhost:8080/lancamentos';
  

  criar(dados: DadosLancamentos) : Observable<DetalhesLancamento> {
    return this.http.post<DetalhesLancamento>(this.baseUrl, dados);
  }

  listarCategoriaDisponiveis() : Observable<DetalhesCategoria[]> {
    return this.http.get<DetalhesCategoria[]>(`${this.baseUrl}/categorias-disponiveis`);
  } 

  listarCartoesDisponiveis() : Observable<DetalhesCartao[]> {
    return this.http.get<DetalhesCartao[]>(`${this.baseUrl}/cartoes-disponiveis`);
  } 
}
