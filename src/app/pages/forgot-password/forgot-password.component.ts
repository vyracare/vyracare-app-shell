import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { VcButtonComponent, VcToastService } from '@vyracare/design-system';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VcButtonComponent],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
/** Coordena a redefinicao de senha e os feedbacks globais da operacao. */
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: VcToastService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  /** Valida e envia a nova senha, limpando o formulario depois do sucesso. */
  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    this.success.set(false);

    const email = (this.form.value.email ?? '').trim();
    const password = this.form.value.password ?? '';

    this.authService.forgotPassword(email, password).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.form.reset();
        this.toast.success('Senha atualizada', 'A nova senha foi salva com sucesso.');
      },
      error: () => {
        this.loading.set(false);
        const message = 'Falha ao atualizar a senha. Tente novamente.';
        this.error.set(message);
        this.toast.error('Nao foi possivel atualizar a senha', message);
      }
    });
  }

  /** Retorna o usuario para a tela de autenticacao. */
  goToLogin(): void {
    this.router.navigate(['/login']);
  }
}
