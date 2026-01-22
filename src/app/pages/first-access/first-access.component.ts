import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-first-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './first-access.component.html',
  styleUrls: ['./first-access.component.scss']
})
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
    private router: Router
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.passwordForm = this.fb.group({
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  private setEmailControlEnabled(enabled: boolean) {
    const control = this.emailForm.get('email');
    if (!control) return;
    if (enabled) {
      control.enable({ emitEvent: false });
    } else {
      control.disable({ emitEvent: false });
    }
  }

  checkEmail() {
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
        this.error.set('Falha ao validar o email. Tente novamente.');
      }
    });
  }

  setPassword() {
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
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error || 'Falha ao definir a senha. Tente novamente.');
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/login']);
  }
}
