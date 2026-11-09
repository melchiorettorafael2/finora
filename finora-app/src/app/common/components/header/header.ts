import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { AuthService } from '../../../auth/auth-service/auth-service';

@Component({
  selector: 'app-header',
  imports: [],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  host: {
    '(document:click)': 'fecharAoClicarFora($event)',
    '(document:keydown.escape)': 'menuAberto.set(false)',
  },
})
export class Header {
  titulo = input.required<string>();

  private authService = inject(AuthService);
  private elementRef = inject(ElementRef<HTMLElement>);

  nomeUsuario = signal(this.authService.getNomeUsuario() || 'Usuário');
  primeiroNome = computed(() => this.nomeUsuario().trim().split(/\s+/)[0]);
  menuAberto = signal(false);

  alternarMenu(): void {
    this.menuAberto.update(aberto => !aberto);
  }

  fecharAoClicarFora(evento: MouseEvent): void {
    if (this.menuAberto() && !this.elementRef.nativeElement.contains(evento.target as Node)) {
      this.menuAberto.set(false);
    }
  }

  sair(): void {
    this.menuAberto.set(false);
    this.authService.logout();
  }
}
