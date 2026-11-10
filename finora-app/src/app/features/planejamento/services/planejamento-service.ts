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
      // Renda de ~R$ 5.000/mês: orçamento de 70% e o restante para as metas
      receitaPrevista: 5000,
      orcamentos: [
        { categoria: 'Moradia', limite: 1500, gasto: 1460 },
        { categoria: 'Alimentação', limite: 900, gasto: 985.4 },
        { categoria: 'Transporte', limite: 400, gasto: 286.5 },
        { categoria: 'Lazer', limite: 300, gasto: 262 },
        { categoria: 'Saúde', limite: 250, gasto: 89.9 },
        { categoria: 'Educação', limite: 150, gasto: 149.9 },
      ],
      metas: [
        { nome: 'Reserva de emergência', icone: 'fa-shield-heart', objetivo: 15000, acumulado: 6800, prazo: '2027-12-31' },
        { nome: 'Viagem de férias', icone: 'fa-plane', objetivo: 4000, acumulado: 1350, prazo: '2027-07-15' },
        { nome: 'Notebook novo', icone: 'fa-laptop', objetivo: 4500, acumulado: 3900, prazo: '2026-12-20' },
      ],
      contasPrevistas: [
        { descricao: 'Salário', categoria: 'Renda', vencimento: `${mes}-05`, valor: 4500, tipo: 'RECEITA', pago: true },
        { descricao: 'Aluguel', categoria: 'Moradia', vencimento: `${mes}-10`, valor: 1200, tipo: 'DESPESA', pago: true },
        { descricao: 'Internet', categoria: 'Moradia', vencimento: `${mes}-12`, valor: 99.9, tipo: 'DESPESA', pago: true },
        { descricao: 'Plano de saúde', categoria: 'Saúde', vencimento: `${mes}-15`, valor: 189.9, tipo: 'DESPESA', pago: false },
        { descricao: 'Freelance', categoria: 'Renda', vencimento: `${mes}-20`, valor: 500, tipo: 'RECEITA', pago: false },
        { descricao: 'Curso online', categoria: 'Educação', vencimento: `${mes}-25`, valor: 49.9, tipo: 'DESPESA', pago: false },
      ],
    });
  }
}
