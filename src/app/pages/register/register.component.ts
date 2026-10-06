import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { VcButtonComponent, VcInputComponent, VcToastService } from '@vyracare/design-system';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    VcButtonComponent,
    VcInputComponent
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
/** Coordena o cadastro publico e seus retornos seguros de sucesso ou falha. */
export class RegisterComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: VcToastService
  ) {
    this.form = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Valida e envia o cadastro, notificando o resultado antes de navegar. */
  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const { fullName, email, password } = this.form.value;

    this.authService.register({ fullName, email, password }).pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: () => {
        this.toast.success('Conta criada', 'Seu cadastro foi concluido com sucesso.');
        this.goToLogin();
      },
      error: (err) => {
        const message = this.extractErrorMessage(err);
        this.error = message;
        this.toast.error('Nao foi possivel criar a conta', message);
      }
    });
  }

  /** Retorna o usuario para a tela de autenticacao. */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }

  /** Converte falhas conhecidas da API em mensagens que nao expoem detalhes internos. */
  private extractErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (typeof error.error === 'string' && error.error.trim()) {
        return this.translateBackendMessage(error.error);
      }

      const apiMessage = error.error?.message;
      if (typeof apiMessage === 'string' && apiMessage.trim()) {
        return this.translateBackendMessage(apiMessage);
      }

      if (error.status === 409) {
        return 'Ja existe uma conta para este e-mail. Acesse sua conta ou utilize outro e-mail.';
      }

      if (error.status === 400) {
        return 'Os dados informados sao invalidos. Revise os campos e tente novamente.';
      }
    }

    return 'Falha no registro. Tente novamente.';
  }

  /** Traduz somente mensagens publicas conhecidas e oculta respostas inesperadas. */
  private translateBackendMessage(message: string): string {
    const normalized = message.trim().toLowerCase();

    if (normalized === 'user already exists') {
      return 'Ja existe uma conta para este e-mail. Acesse sua conta ou utilize outro e-mail.';
    }

    if (normalized === 'email is required') {
      return 'Informe um e-mail valido para concluir o cadastro.';
    }

    return 'Nao foi possivel concluir o cadastro. Revise os dados e tente novamente.';
  }
}
