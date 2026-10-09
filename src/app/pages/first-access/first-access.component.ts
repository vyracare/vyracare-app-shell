import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VcButtonComponent, VcInputComponent, VcToastService } from '@vyracare/design-system';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-first-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VcButtonComponent, VcInputComponent],
  templateUrl: './first-access.component.html',
  styleUrls: ['./first-access.component.scss']
})
/** Coordena a validacao do primeiro acesso e a definicao segura da senha. */
export class FirstAccessComponent {
  emailForm: FormGroup;
  passwordForm: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);
  canSetPassword = signal(false);
  private checkedEmail: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: VcToastService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Alterna a edicao do e-mail durante as etapas do primeiro acesso. */
  private setEmailControlEnabled(enabled: boolean): void {
    const control = this.emailForm.get('email');
    if (!control) return;
    if (enabled) {
      control.enable({ emitEvent: false });
    } else {
      control.disable({ emitEvent: false });
    }
  }

  /** Confirma pela API se o e-mail pode definir a senha inicial. */
  checkEmail(): void {
    if (this.emailForm.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);
    this.canSetPassword.set(false);
    this.checkedEmail = null;
    this.setEmailControlEnabled(true);

    const email = (this.emailForm.value.email ?? '').trim();

    this.authService.checkFirstAccess(email).subscribe({
      next: (response) => {
        this.loading.set(false);

        if (!response?.exists) {
          this.error.set('Email nao encontrado. Verifique e tente novamente.');
          return;
        }

        if (!response?.canSetPassword) {
          this.error.set('Senha ja definida. Use o login para acessar.');
          return;
        }

        this.checkedEmail = email;
        this.canSetPassword.set(true);
        this.setEmailControlEnabled(false);
      },
      error: () => {
        this.loading.set(false);
        const message = 'Falha ao validar o email. Tente novamente.';
        this.error.set(message);
        this.toast.error('Nao foi possivel validar o email', message);
      }
    });
  }

  /** Persiste a senha inicial e notifica o resultado da requisicao. */
  setPassword(): void {
    if (this.passwordForm.invalid || !this.checkedEmail) return;

    this.loading.set(true);
    this.error.set(null);

    const { password } = this.passwordForm.value;

    this.authService.setFirstAccessPassword(this.checkedEmail, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.canSetPassword.set(false);
        this.setEmailControlEnabled(true);
        this.passwordForm.reset();
        this.toast.success('Senha definida', 'Seu primeiro acesso foi configurado com sucesso.');
      },
      error: () => {
        this.loading.set(false);
        const message = 'Falha ao definir a senha. Tente novamente.';
        this.error.set(message);
        this.toast.error('Nao foi possivel definir a senha', message);
      }
    });
  }

  /** Retorna o usuario para a tela de autenticacao. */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
