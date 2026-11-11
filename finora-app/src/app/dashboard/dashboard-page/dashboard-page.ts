import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, map, startWith, switchMap } from 'rxjs';
import { DashboardService } from '../dashboard-service';
import { Dashboard, DespesaCategoriaResumo } from '../dados-dashboard';
import { ResumoMensal } from '../../features/relatorios/models/dados-relatorio';
import { Header } from '../../common/components/header/header';
import { MonthPicker } from '../../common/components/month-picker/month-picker';
import { Modal } from '../../common/components/modal/modal';
import { CadastroLancamento } from '../../lancamentos/cadastro-lancamento/cadastro-lancamento';

interface MesEvolucao extends ResumoMensal {
  alturaReceitas: number; // % da maior barra do gráfico
  alturaDespesas: number;
  atual: boolean;
}

interface DashboardView extends Dashboard {
  variacaoReceitas: number | null; // % em relação ao mês anterior; null se o anterior foi zero
  variacaoDespesas: number | null;
  percentualOrcamento: number;
  orcamentoEstourado: boolean; // gasto acima do limite (o percentual arredondado pode mostrar 100%)
  meses: MesEvolucao[];
}

@Component({
  selector: 'app-dashboard-page',
  imports: [Header, CommonModule, ReactiveFormsModule, RouterLink, MonthPicker, Modal, CadastroLancamento],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage {

  service = inject(DashboardService);
  private toast = inject(ToastrService);

  mes = new FormControl(this.mesAtual(), { nonNullable: true });
  modalLancamentoAberto = signal(false);
  private recarregar$ = new BehaviorSubject<void>(undefined);

  dashboard$: Observable<DashboardView> = combineLatest([
    this.mes.valueChanges.pipe(startWith(this.mes.value)),
    this.recarregar$,
  ]).pipe(
    // "Todos os meses" não se aplica ao resumo mensal: volta para o mês atual
    map(([mes]) => mes || this.mesAtual()),
    switchMap(mes => this.service.obterDashboard(mes).pipe(
      catchError(() => {
        this.toast.error('Erro ao carregar o dashboard.', 'Erro');
        return EMPTY;
      })
    )),
    map(dashboard => this.montarView(dashboard))
  );

  // Depois de cadastrar pelo modal, recarrega o resumo para o lançamento novo aparecer
  aoSalvarLancamento(){
    this.modalLancamentoAberto.set(false);
    this.recarregar$.next();
  }

  percentual(valor: number, total: number){

    if(!total){
      return 0;
    }

    const resultado = (valor/total) * 100;

    return Math.round(resultado);
  }

  maiorDespesaCategoria(despesas: DespesaCategoriaResumo[]){
    if(!despesas.length){
      return 0;
    }
    const valoresDespesas = despesas.map(despesa => despesa.valor);
    return Math.max(...valoresDespesas);
  }

  iconeVariacao(variacao: number) {
    if (variacao > 0) {
      return 'fa-caret-up';
    }
    return variacao < 0 ? 'fa-caret-down' : 'fa-minus';
  }

  private montarView(d: Dashboard): DashboardView {
    const maiorValorMes = Math.max(0, ...d.evolucao.flatMap(m => [m.receitas, m.despesas]));

    return {
      ...d,
      variacaoReceitas: this.variacao(d.resumo.receitas, d.resumoMesAnterior.receitas),
      variacaoDespesas: this.variacao(d.resumo.despesas, d.resumoMesAnterior.despesas),
      percentualOrcamento: d.orcamento ? this.percentual(d.orcamento.gasto, d.orcamento.limite) : 0,
      orcamentoEstourado: !!d.orcamento && d.orcamento.gasto > d.orcamento.limite,
      meses: d.evolucao.map(mes => ({
        ...mes,
        alturaReceitas: this.percentual(mes.receitas, maiorValorMes),
        alturaDespesas: this.percentual(mes.despesas, maiorValorMes),
        atual: mes.mes === d.mes,
      })),
    };
  }

  private variacao(atual: number, anterior: number): number | null {
    return anterior ? Math.round(((atual - anterior) / anterior) * 100) : null;
  }

  private mesAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  }

}
