import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VcButtonComponent, VcInputComponent, VcToastService } from '@vyracare/design-system';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    VcButtonComponent,
    VcInputComponent
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
/** Coordena a autenticacao e apresenta falhas sem expor respostas internas da API. */
export class LoginComponent {
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
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  /** Valida as credenciais, persiste o token recebido e inicia a sessao. */
  onSubmit(): void {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;

        const token = response?.token ?? response?.accessToken ?? response?.access_token;
        if (!token) {
          const message = 'Não foi possível validar a sessão. Tente novamente.';
          this.error = message;
          this.toast.error('Falha ao iniciar sessao', message);
          return;
        }

        this.authService.saveToken(token);
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        this.loading = false;
        const message = 'Falha no login. Verifique suas credenciais.';
        this.error = message;
        this.toast.error('Nao foi possivel entrar', message);
      }
    });
  }

  /** Abre o fluxo de criacao de conta. */
  goToRegister(): void {
    this.router.navigate(['/register']);
  }

  /** Abre o fluxo de definicao da senha inicial. */
  goToFirstAccess(): void {
    this.router.navigate(['/first-access']);
  }
}
