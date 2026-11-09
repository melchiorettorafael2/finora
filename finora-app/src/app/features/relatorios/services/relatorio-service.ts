import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CategoriaRelatorio, LancamentoRelatorio, PeriodoRelatorio, Relatorio, ResumoMensal } from '../models/dados-relatorio';

/**
 * Ainda não existe endpoint de relatórios na API: o service monta dados de exemplo
 * (determinísticos, para a tela não "pular" a cada troca de período). Quando o back
 * estiver pronto, basta trocar por `this.http.get<Relatorio>(`${this.baseUrl}?meses=${periodo}`)`.
 */
@Injectable({
  providedIn: 'root',
})
export class RelatorioService {

  baseUrl = 'http://localhost:8080/relatorios';

  obterRelatorio(periodo: PeriodoRelatorio): Observable<Relatorio> {
    const meses = this.mesesExemplo(periodo);
    const fator = periodo / 3;

    const categorias: CategoriaRelatorio[] = [
      { categoria: 'Moradia', valor: 6450 * fator, variacao: 2 },
      { categoria: 'Alimentação', valor: 3820.4 * fator, variacao: 11 },
      { categoria: 'Transporte', valor: 1290.75 * fator, variacao: -6 },
      { categoria: 'Lazer', valor: 1105 * fator, variacao: 18 },
      { categoria: 'Saúde', valor: 860 * fator, variacao: -3 },
      { categoria: 'Educação', valor: 899.7 * fator, variacao: 0 },
    ];

    const ultimoMes = meses[meses.length - 1].mes;
    const maioresLancamentos: LancamentoRelatorio[] = [
      { descricao: 'Salário', categoria: 'Renda', data: `${ultimoMes}-05`, valor: 6500, tipo: 'RECEITA' },
      { descricao: 'Aluguel', categoria: 'Moradia', data: `${ultimoMes}-10`, valor: 1800, tipo: 'DESPESA' },
      { descricao: 'Supermercado', categoria: 'Alimentação', data: `${ultimoMes}-08`, valor: 742.3, tipo: 'DESPESA' },
      { descricao: 'Freelance', categoria: 'Renda', data: `${meses[0].mes}-20`, valor: 1200, tipo: 'RECEITA' },
      { descricao: 'Passagem aérea', categoria: 'Lazer', data: `${meses[0].mes}-14`, valor: 980, tipo: 'DESPESA' },
    ];

    return of({ periodo, meses, categorias, maioresLancamentos });
  }

  private mesesExemplo(periodo: PeriodoRelatorio): ResumoMensal[] {
    const hoje = new Date();

    return Array.from({ length: periodo }, (_, i) => {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - (periodo - 1 - i), 1);
      const semente = data.getMonth() + 1;
      return {
        mes: `${data.getFullYear()}-${String(semente).padStart(2, '0')}`,
        receitas: 6500 + (semente % 3) * 450,
        despesas: 4700 + ((semente * 7) % 5) * 380,
      };
    });
  }
}
