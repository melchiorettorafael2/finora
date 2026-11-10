import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toObservable } from '@angular/core/rxjs-interop';
import { EMPTY, Observable, catchError, map, switchMap } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { Header } from '../../../../common/components/header/header';
import { RelatorioService } from '../../services/relatorio-service';
import { CategoriaRelatorio, PeriodoRelatorio, Relatorio, ResumoMensal } from '../../models/dados-relatorio';

interface MesView extends ResumoMensal {
  saldo: number;
  alturaReceitas: number; // % da maior barra do gráfico
  alturaDespesas: number;
}

interface CategoriaView extends CategoriaRelatorio {
  percentualTotal: number;
  largura: number; // % da maior categoria
}

interface RelatorioView {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  mediaDespesas: number;
  taxaEconomia: number;
  meses: MesView[];
  categorias: CategoriaView[];
}

@Component({
  selector: 'app-relatorios',
  imports: [CommonModule, Header],
  templateUrl: './relatorios.html',
  styleUrl: './relatorios.scss',
})
export class RelatoriosPage {

  private service = inject(RelatorioService);
  private toast = inject(ToastrService);

  periodos: { valor: PeriodoRelatorio; rotulo: string }[] = [
    { valor: 3, rotulo: '3 meses' },
    { valor: 6, rotulo: '6 meses' },
    { valor: 12, rotulo: '12 meses' },
  ];

  periodo = signal<PeriodoRelatorio>(6);

  relatorio$: Observable<RelatorioView> = toObservable(this.periodo).pipe(
    switchMap(periodo => this.service.obterRelatorio(periodo).pipe(
      catchError(() => {
        this.toast.error('Erro ao carregar o relatório.', 'Erro');
        return EMPTY;
      })
    )),
    map(relatorio => this.montarView(relatorio))
  );

  private montarView(r: Relatorio): RelatorioView {
    const totalReceitas = this.somar(r.meses.map(m => m.receitas));
    const totalDespesas = this.somar(r.meses.map(m => m.despesas));
    const maiorValorMes = Math.max(0, ...r.meses.flatMap(m => [m.receitas, m.despesas]));

    const totalCategorias = this.somar(r.categorias.map(c => c.valor));
    const maiorCategoria = Math.max(0, ...r.categorias.map(c => c.valor));

    return {
      totalReceitas,
      totalDespesas,
      saldo: totalReceitas - totalDespesas,
      mediaDespesas: r.meses.length ? totalDespesas / r.meses.length : 0,
      taxaEconomia: this.percentual(totalReceitas - totalDespesas, totalReceitas),
      meses: r.meses.map(mes => ({
        ...mes,
        saldo: mes.receitas - mes.despesas,
        alturaReceitas: this.percentual(mes.receitas, maiorValorMes),
        alturaDespesas: this.percentual(mes.despesas, maiorValorMes),
      })),
      categorias: [...r.categorias]
        .sort((a, b) => b.valor - a.valor)
        .map(categoria => ({
          ...categoria,
          percentualTotal: this.percentual(categoria.valor, totalCategorias),
          largura: this.percentual(categoria.valor, maiorCategoria),
        })),
    };
  }

  private percentual(valor: number, total: number) {
    return total ? Math.round((valor / total) * 100) : 0;
  }

  private somar(valores: number[]) {
    return valores.reduce((total, valor) => total + valor, 0);
  }
}
