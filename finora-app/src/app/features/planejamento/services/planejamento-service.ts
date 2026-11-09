import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Planejamento } from '../models/dados-planejamento';

/**
 * Ainda não existe endpoint de planejamento na API: o service devolve dados de exemplo
 * no mesmo formato que a tela espera. Quando o back estiver pronto, basta trocar por
 * `this.http.get<Planejamento>(`${this.baseUrl}?mes=${mes}`)`.
 */
@Injectable({
  providedIn: 'root',
})
export class PlanejamentoService {

  baseUrl = 'http://localhost:8080/planejamento';

  obterPlanejamento(mes: string): Observable<Planejamento> {
    return of({
      mes,
      receitaPrevista: 7200,
      orcamentos: [
        { categoria: 'Moradia', limite: 2200, gasto: 2150 },
        { categoria: 'Alimentação', limite: 1200, gasto: 1340.5 },
        { categoria: 'Transporte', limite: 600, gasto: 412.8 },
        { categoria: 'Lazer', limite: 400, gasto: 355 },
        { categoria: 'Saúde', limite: 350, gasto: 120 },
        { categoria: 'Educação', limite: 300, gasto: 299.9 },
      ],
      metas: [
        { nome: 'Reserva de emergência', icone: 'fa-shield-heart', objetivo: 20000, acumulado: 12400, prazo: '2027-06-30' },
        { nome: 'Viagem de férias', icone: 'fa-plane', objetivo: 8000, acumulado: 2750, prazo: '2027-01-15' },
        { nome: 'Notebook novo', icone: 'fa-laptop', objetivo: 6500, acumulado: 5900, prazo: '2026-12-20' },
      ],
      contasPrevistas: [
        { descricao: 'Salário', categoria: 'Renda', vencimento: `${mes}-05`, valor: 6500, tipo: 'RECEITA', pago: true },
        { descricao: 'Aluguel', categoria: 'Moradia', vencimento: `${mes}-10`, valor: 1800, tipo: 'DESPESA', pago: true },
        { descricao: 'Internet', categoria: 'Moradia', vencimento: `${mes}-12`, valor: 120, tipo: 'DESPESA', pago: true },
        { descricao: 'Plano de saúde', categoria: 'Saúde', vencimento: `${mes}-15`, valor: 320, tipo: 'DESPESA', pago: false },
        { descricao: 'Freelance', categoria: 'Renda', vencimento: `${mes}-20`, valor: 700, tipo: 'RECEITA', pago: false },
        { descricao: 'Curso online', categoria: 'Educação', vencimento: `${mes}-25`, valor: 89.9, tipo: 'DESPESA', pago: false },
      ],
    });
  }
}
