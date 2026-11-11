import { Component, ElementRef, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/auth-service/auth-service';
import { UsuarioService } from '../../../features/usuario/services/usuario-service';
import { PreferenciasService } from '../../services/preferencias-service';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
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
  private usuarioService = inject(UsuarioService);
  private elementRef = inject(ElementRef<HTMLElement>);

  preferencias = inject(PreferenciasService);

  nomeUsuario = computed(() => this.authService.nomeUsuario() || 'Usuário');
  fotoUrl = this.usuarioService.fotoUrl;
  menuAberto = signal(false);
  temaClaro = computed(() => this.preferencias.tema() === 'claro');

  // O header é recriado a cada troca de página: sem isto, a bolinha do switch
  // animaria até a posição do modo claro toda vez. Só anima depois de um clique.
  animarSwitch = signal(false);

  constructor() {
    // Só faz a requisição na primeira vez da sessão; depois reaproveita a foto em memória
    this.usuarioService.carregarFoto();
  }

  alternarTema(): void {
    this.animarSwitch.set(true);
    this.preferencias.alternarTema();
  }

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
