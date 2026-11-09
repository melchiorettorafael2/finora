import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Observable, map, startWith, switchMap } from 'rxjs';
import { Header } from '../../../../common/components/header/header';
import { MonthPicker } from '../../../../common/components/month-picker/month-picker';
import { PlanejamentoService } from '../../services/planejamento-service';
import { ContaPrevista, MetaEconomia, OrcamentoCategoria, Planejamento } from '../../models/dados-planejamento';

type StatusOrcamento = 'ok' | 'alerta' | 'estourado';

interface OrcamentoView extends OrcamentoCategoria {
  percentual: number;
  restante: number;
  status: StatusOrcamento;
}

interface MetaView extends MetaEconomia {
  percentual: number;
}

interface PlanejamentoView {
  mes: string;
  receitaPrevista: number;
  totalLimite: number;
  totalGasto: number;
  disponivel: number;
  percentualUsado: number;
  percentualReceita: number;
  categoriasEstouradas: number;
  orcamentos: OrcamentoView[];
  metas: MetaView[];
  contasPrevistas: ContaPrevista[];
  contasPendentes: number;
}

// A partir de quanto do limite a categoria entra em alerta
const LIMITE_ALERTA = 85;

@Component({
  selector: 'app-planejamento',
  imports: [CommonModule, ReactiveFormsModule, Header, MonthPicker],
  templateUrl: './planejamento.html',
  styleUrl: './planejamento.scss',
})
export class PlanejamentoPage {

  private service = inject(PlanejamentoService);

  mes = new FormControl(this.mesAtual(), { nonNullable: true });

  planejamento$: Observable<PlanejamentoView> = this.mes.valueChanges.pipe(
    startWith(this.mes.value),
    // "Todos os meses" não faz sentido para um orçamento: volta para o mês atual
    map(mes => mes || this.mesAtual()),
    switchMap(mes => this.service.obterPlanejamento(mes)),
    map(planejamento => this.montarView(planejamento))
  );

  rotuloStatus: Record<StatusOrcamento, string> = {
    ok: 'Dentro do limite',
    alerta: 'Perto do limite',
    estourado: 'Acima do limite',
  };

  private montarView(p: Planejamento): PlanejamentoView {
    const orcamentos = p.orcamentos.map(orcamento => {
      const percentual = this.percentual(orcamento.gasto, orcamento.limite);
      return {
        ...orcamento,
        percentual,
        restante: orcamento.limite - orcamento.gasto,
        status: this.status(percentual),
      };
    });

    const totalLimite = this.somar(p.orcamentos.map(o => o.limite));
    const totalGasto = this.somar(p.orcamentos.map(o => o.gasto));

    return {
      mes: p.mes,
      receitaPrevista: p.receitaPrevista,
      totalLimite,
      totalGasto,
      disponivel: totalLimite - totalGasto,
      percentualUsado: this.percentual(totalGasto, totalLimite),
      percentualReceita: this.percentual(totalLimite, p.receitaPrevista),
      categoriasEstouradas: orcamentos.filter(o => o.status === 'estourado').length,
      orcamentos,
      metas: p.metas.map(meta => ({ ...meta, percentual: this.percentual(meta.acumulado, meta.objetivo) })),
      contasPrevistas: [...p.contasPrevistas].sort((a, b) => a.vencimento.localeCompare(b.vencimento)),
      contasPendentes: p.contasPrevistas.filter(c => !c.pago).length,
    };
  }

  private status(percentual: number): StatusOrcamento {
    if (percentual > 100) {
      return 'estourado';
    }
    return percentual >= LIMITE_ALERTA ? 'alerta' : 'ok';
  }

  private percentual(valor: number, total: number) {
    return total ? Math.round((valor / total) * 100) : 0;
  }

  private somar(valores: number[]) {
    return valores.reduce((total, valor) => total + valor, 0);
  }

  private mesAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  }
}
