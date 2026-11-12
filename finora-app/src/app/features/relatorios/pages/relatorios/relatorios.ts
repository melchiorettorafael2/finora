import { Component, inject, signal } from '@angular/core';
import { CommonModule, DOCUMENT, formatDate } from '@angular/common';
import { AuthService } from '../../../../auth/auth-service/auth-service';
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
  primeiroMes: string; // 'yyyy-MM', para o cabeçalho da impressão
  ultimoMes: string;
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
  private authService = inject(AuthService);
  private document = inject(DOCUMENT);

  nomeUsuario = this.authService.nomeUsuario;
  geradoEm = signal(new Date());

  periodos: { valor: PeriodoRelatorio; rotulo: string }[] = [
    { valor: 3, rotulo: '3 meses' },
    { valor: 6, rotulo: '6 meses' },
    { valor: 12, rotulo: '12 meses' },
  ];

  periodo = signal<PeriodoRelatorio>(6);

  relatorio$: Observable<RelatorioView> = toObservable(this.periodo).pipe(
    switchMap(periodo => this.service.obterRelatorio(periodo).pipe(
      catchError(() => {
        this.toast.error('Não foi possível carregar o relatório.', 'Erro');
        return EMPTY;
      })
    )),
    map(relatorio => this.montarView(relatorio))
  );

  /**
   * Abre a impressão do navegador (onde dá para "Salvar como PDF"). O layout de impressão
   * fica nos estilos @media print. O título da aba vira o nome sugerido para o arquivo PDF.
   */
  imprimir() {
    this.geradoEm.set(new Date());
    const tituloOriginal = this.document.title;
    const hoje = formatDate(this.geradoEm(), 'yyyy-MM-dd', 'pt-BR');
    this.document.title = `Finora - Relatorio ${this.periodo()} meses - ${hoje}`;

    // Espera o Angular atualizar a data de geração na tela antes de abrir a impressão
    setTimeout(() => {
      window.print();
      this.document.title = tituloOriginal;
    });
  }

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
      primeiroMes: r.meses[0]?.mes ?? '',
      ultimoMes: r.meses[r.meses.length - 1]?.mes ?? '',
    };
  }

  private percentual(valor: number, total: number) {
    return total ? Math.round((valor / total) * 100) : 0;
  }

  private somar(valores: number[]) {
    return valores.reduce((total, valor) => total + valor, 0);
  }
}
