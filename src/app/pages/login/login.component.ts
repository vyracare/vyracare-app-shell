import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;

    this.authService.login({ email, password }).subscribe({
      next: (response) => {
        this.loading = false;

        const token = response?.token ?? response?.accessToken ?? response?.access_token;
        if (!token) {
          this.error = 'Não foi possível validar a sessão. Tente novamente.';
          return;
        }

        this.authService.saveToken(token);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error || 'Falha no login. Verifique suas credenciais.';
      }
    });
  }

  goToRegister() {
    this.router.navigate(['/register']);
  }

  goToFirstAccess() {
    this.router.navigate(['/first-access']);
  }
}
