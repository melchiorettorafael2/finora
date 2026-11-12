import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../auth-service/auth-service';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Validators } from '@angular/forms';
import { CadastroUsuarioForm, LoginForm } from '../dados-auth';


interface AuthForm{
  nome: FormControl<string>;
  login: FormControl<string>;
  senha: FormControl<string>; 
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {

  form!: FormGroup<AuthForm>;
  modo: 'login' | 'cadastro' = 'login';
  mostrarSenha = false;
  anoAtual = new Date().getFullYear();

  authService = inject(AuthService);
  router = inject(Router);
  toast = inject(ToastrService);

  ngOnInit(): void {
    this.form = new FormGroup<AuthForm>({
      nome: new FormControl('', { nonNullable: true }),
      login: new FormControl('', { nonNullable: true, validators: [Validators.required]  }),
      senha: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)]  }),
    });

    if(this.authService.isAuthenticated()) {
      this.router.navigate(['/paginas/dashboard']);
    }
  }

  alternarModo(modo: 'login' | 'cadastro'): void {
    this.modo = modo;

    if(modo === 'cadastro'){
      this.form.controls.nome.setValidators([Validators.required]);
    } else{
      this.form.controls.nome.clearValidators();
    }
    this.form.controls.nome.updateValueAndValidity();
  }
  
  handleSubmit(): void {
    if(this.form.invalid) {
      this.form.markAllAsTouched();
      this.toast.error('Verifique os dados informados.', 'Erro');
      return;
    }

    if(this.modo === 'cadastro') {
      const dadosCadastro = this.form.value as CadastroUsuarioForm;
      this.authService.cadastrar(dadosCadastro).subscribe({
        next: (response) => {
          // Conta nova entra direto (a verificação em duas etapas é opcional, em Configurações)
          this.onAuthSuccess(response);
          this.toast.success('Conta criada. Bem-vindo!', 'Sucesso');
        },
        error: (error) => {
          this.onAuthError(error);
        }
      }); 
      return; 
    }

    const dadosLogin = this.form.value as LoginForm;
    this.authService.login(dadosLogin).subscribe({
      next: (response) => {
        // Quem ativou o 2FA segue para a tela do código do Google Authenticator
        if (response.doisFatoresPendente) {
          this.router.navigate(['/verificacao']);
          return;
        }
        this.onAuthSuccess(response);
        this.toast.success('Bem-vindo de volta!', 'Sucesso');
      },
      error: (error) => {
        this.onAuthError(error);
      }
    });
  }

  onAuthSuccess(response: any): void {
    localStorage.setItem('token', response.token);
    localStorage.setItem('tipo', response.tipo);
    localStorage.setItem('expiraEm', response.expiraEm.toString());
    localStorage.setItem('nome', response.nome);

    this.router.navigate(['/paginas/dashboard']);
  }

  onAuthError(response: any): void {
    //Unauthorized error handling
    if(response.status === 401) {
      this.toast.error('Email ou senha inválidos.', 'Erro');
      return;
    } 

    //validation
    if(response.status === 422) {
      this.toast.error('Confira os campos destacados.', 'Erro');
      return;
    }
      console.error('Erro na autenticação:', response);
      this.toast.error('Não foi possível entrar. Tente de novo.', 'Erro');
  } 

}
