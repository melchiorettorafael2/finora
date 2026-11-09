import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { AuthService } from '../auth-service/auth-service';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Validators } from '@angular/forms';


interface AuthForm{
  nome: FormControl<string>;
  login: FormControl<string>;
  senha: FormControl<string>; 
}

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
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
    console.log('Formulário enviado:', this.form.value);
  }

}
