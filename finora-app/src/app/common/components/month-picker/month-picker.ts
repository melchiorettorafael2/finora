import { Component, ElementRef, LOCALE_ID, computed, forwardRef, inject, input, output, signal } from '@angular/core';
import { formatDate } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

const FORMATO_MES = /^\d{4}-\d{2}$/;

@Component({
  selector: 'app-month-picker',
  imports: [],
  templateUrl: './month-picker.html',
  styleUrl: './month-picker.scss',
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => MonthPicker), multi: true }
  ],
  host: {
    '(document:click)': 'aoClicarFora($event)',
    '(keydown.escape)': 'fechar()',
  },
})
export class MonthPicker implements ControlValueAccessor {
  private elementRef = inject(ElementRef);
  private locale = inject(LOCALE_ID);

  inputId = input<string>();
  alterado = output<string>();

  // 'yyyy-MM' ou '' (todos os meses)
  valor = signal('');
  aberto = signal(false);
  desabilitado = signal(false);
  anoPainel = signal(new Date().getFullYear());

  meses = Array.from({ length: 12 }, (_, i) =>
    this.capitalizar(formatDate(new Date(2000, i, 1), 'MMM', this.locale).replace('.', ''))
  );

  rotulo = computed(() => {
    const data = this.paraData(this.valor());
    return data ? this.capitalizar(formatDate(data, "MMMM 'de' y", this.locale)) : 'Todos os meses';
  });

  private onChange: (valor: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(valor: string | null): void {
    this.valor.set(valor ?? '');
  }

  registerOnChange(fn: (valor: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(desabilitado: boolean): void {
    this.desabilitado.set(desabilitado);
    if (desabilitado) {
      this.aberto.set(false);
    }
  }

  anterior(){
    this.deslocar(-1);
  }

  proximo(){
    this.deslocar(1);
  }

  alternarPainel(){
    if (this.aberto()) {
      this.fechar();
      return;
    }

    const data = this.paraData(this.valor()) ?? new Date();
    this.anoPainel.set(data.getFullYear());
    this.aberto.set(true);
  }

  mudarAnoPainel(delta: number){
    this.anoPainel.update(ano => ano + delta);
  }

  selecionarMes(mes: number){
    this.selecionar(this.formatar(this.anoPainel(), mes));
    this.fechar();
  }

  selecionarMesAtual(){
    const hoje = new Date();
    this.selecionar(this.formatar(hoje.getFullYear(), hoje.getMonth()));
    this.fechar();
  }

  limpar(){
    this.selecionar('');
    this.fechar();
  }

  mesSelecionado(mes: number){
    return this.valor() === this.formatar(this.anoPainel(), mes);
  }

  mesAtual(mes: number){
    const hoje = new Date();
    return this.anoPainel() === hoje.getFullYear() && mes === hoje.getMonth();
  }

  fechar(){
    if (this.aberto()) {
      this.aberto.set(false);
      this.onTouched();
    }
  }

  aoClicarFora(event: MouseEvent){
    if (this.aberto() && !this.elementRef.nativeElement.contains(event.target)) {
      this.fechar();
    }
  }

  private deslocar(delta: number){
    const base = this.paraData(this.valor()) ?? new Date();
    const data = new Date(base.getFullYear(), base.getMonth() + delta, 1);
    this.selecionar(this.formatar(data.getFullYear(), data.getMonth()));
  }

  private selecionar(valor: string){
    if (valor === this.valor()) {
      return;
    }

    this.valor.set(valor);
    this.onChange(valor);
    this.onTouched();
    this.alterado.emit(valor);
  }

  private paraData(valor: string): Date | null {
    if (!FORMATO_MES.test(valor)) {
      return null;
    }

    const [ano, mes] = valor.split('-').map(Number);
    return new Date(ano, mes - 1, 1);
  }

  private formatar(ano: number, mes: number){
    return `${ano}-${String(mes + 1).padStart(2, '0')}`;
  }

  private capitalizar(texto: string){
    return texto.charAt(0).toUpperCase() + texto.slice(1);
  }
}
