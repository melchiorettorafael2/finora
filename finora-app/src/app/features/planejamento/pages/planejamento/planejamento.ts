import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { BehaviorSubject, EMPTY, Observable, catchError, combineLatest, map, startWith, switchMap } from 'rxjs';
import { Header } from '../../../../common/components/header/header';
import { MonthPicker } from '../../../../common/components/month-picker/month-picker';
import { ConfirmDialog } from '../../../../common/components/confirm-dialog/confirm-dialog';
import { Modal } from '../../../../common/components/modal/modal';
import { CadastroMeta } from '../cadastro-meta/cadastro-meta';
import { CadastroOrcamento } from '../cadastro-orcamento/cadastro-orcamento';
import { PlanejamentoService } from '../../services/planejamento-service';
import { MetaEconomia, OrcamentoCategoria, Planejamento } from '../../models/dados-planejamento';

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
  receitasMes: number;
  totalLimite: number;
  totalGasto: number;
  disponivel: number;
  percentualUsado: number;
  percentualReceita: number;
  categoriasEstouradas: number;
  orcamentos: OrcamentoView[];
  metas: MetaView[];
}

interface ItemExclusao {
  tipo: 'orcamento' | 'meta';
  id: string;
  nome: string;
}

// A partir de quanto do limite a categoria entra em alerta
const LIMITE_ALERTA = 85;

@Component({
  selector: 'app-planejamento',
  imports: [CommonModule, ReactiveFormsModule, Header, MonthPicker, ConfirmDialog, Modal, CadastroMeta, CadastroOrcamento],
  templateUrl: './planejamento.html',
  styleUrl: './planejamento.scss',
})
export class PlanejamentoPage {

  private service = inject(PlanejamentoService);
  private toast = inject(ToastrService);

  mes = new FormControl(this.mesAtual(), { nonNullable: true });
  private recarregar$ = new BehaviorSubject<void>(undefined);

  planejamento$: Observable<PlanejamentoView> = combineLatest([
    this.mes.valueChanges.pipe(startWith(this.mes.value)),
    this.recarregar$,
  ]).pipe(
    // "Todos os meses" não faz sentido para um orçamento: volta para o mês atual
    map(([mes]) => mes || this.mesAtual()),
    switchMap(mes => this.service.obterPlanejamento(mes).pipe(
      catchError(() => {
        this.toast.error('Erro ao carregar o planejamento.', 'Erro');
        return EMPTY;
      })
    )),
    map(planejamento => this.montarView(planejamento))
  );

  itemParaExcluir = signal<ItemExclusao | null>(null);
  // Modal de meta: null = fechado; id null = meta nova
  modalMeta = signal<{ id: string | null } | null>(null);

  aoSalvarMeta() {
    this.modalMeta.set(null);
    this.recarregar$.next();
  }

  rotuloStatus: Record<StatusOrcamento, string> = {
    ok: 'Dentro do limite',
    alerta: 'Perto do limite',
    estourado: 'Acima do limite',
  };

  private rotuloTipo: Record<ItemExclusao['tipo'], string> = {
    orcamento: 'orçamento',
    meta: 'meta',
  };

  // Modal de orçamento: null = fechado; categoriaId null = orçamento novo
  modalOrcamento = signal<{ categoriaId: string | null; limite: number | null } | null>(null);

  novoOrcamento() {
    this.modalOrcamento.set({ categoriaId: null, limite: null });
  }

  editarOrcamento(orcamento: OrcamentoCategoria) {
    this.modalOrcamento.set({ categoriaId: orcamento.categoriaId, limite: orcamento.limite });
  }

  aoSalvarOrcamento() {
    this.modalOrcamento.set(null);
    this.recarregar$.next();
  }

  pedirExclusao(tipo: ItemExclusao['tipo'], id: string, nome: string) {
    this.itemParaExcluir.set({ tipo, id, nome });
  }

  tituloExclusao(item: ItemExclusao) {
    return `Remover ${this.rotuloTipo[item.tipo]}`;
  }

  confirmarExclusao() {
    const item = this.itemParaExcluir();
    if (!item) {
      return;
    }

    const requisicao: Record<ItemExclusao['tipo'], Observable<void>> = {
      orcamento: this.service.removerOrcamento(item.id),
      meta: this.service.removerMeta(item.id),
    };

    requisicao[item.tipo].subscribe({
      next: () => {
        this.toast.success(`${this.capitalizar(this.rotuloTipo[item.tipo])} removido(a) com sucesso!`, 'Sucesso');
        this.itemParaExcluir.set(null);
        this.recarregar$.next();
      },
      error: () => {
        this.toast.error(`Erro ao remover ${this.rotuloTipo[item.tipo]}.`, 'Erro');
        this.itemParaExcluir.set(null);
      },
    });
  }

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
      receitasMes: p.receitasMes,
      totalLimite,
      totalGasto,
      disponivel: totalLimite - totalGasto,
      percentualUsado: this.percentual(totalGasto, totalLimite),
      percentualReceita: this.percentual(totalLimite, p.receitasMes),
      categoriasEstouradas: orcamentos.filter(o => o.status === 'estourado').length,
      orcamentos,
      metas: p.metas.map(meta => ({ ...meta, percentual: this.percentual(meta.acumulado, meta.objetivo) })),
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

  private capitalizar(texto: string) {
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }

  private mesAtual() {
    const hoje = new Date();
    return `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  }
}
