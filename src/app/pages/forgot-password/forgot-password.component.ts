import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
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
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error || 'Falha ao atualizar a senha. Tente novamente.');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
