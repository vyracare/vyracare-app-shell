import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { VcButtonComponent, VcInputComponent, VcToastService } from '@vyracare/design-system';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'vyracare-company-onboarding',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, VcButtonComponent, VcInputComponent],
  templateUrl: './company-onboarding.component.html',
  styleUrls: ['./company-onboarding.component.scss']
})
export class CompanyOnboardingComponent {
  readonly form: FormGroup;
  loading = false;
  error: string | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly toast: VcToastService
  ) {
    this.form = this.fb.group({
      legalName: ['', Validators.required],
      tradeName: [''],
      document: ['']
    });
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { legalName, tradeName, document } = this.form.getRawValue();
    this.loading = true;
    this.error = null;
    this.auth.createOrganization({
      legalName: legalName!,
      tradeName: tradeName || undefined,
      document: document || undefined
    }).pipe(finalize(() => this.loading = false)).subscribe({
      next: response => {
        if (!response?.token) {
          this.error = 'Nao foi possivel atualizar sua sessao.';
          return;
        }
        this.auth.saveToken(response.token);
        this.toast.success('Empresa criada', 'Voce agora e proprietario e administrador. Seu teste de 30 dias comecou.');
        this.router.navigate(['/dashboard']);
      },
      error: (error: unknown) => {
        this.error = error instanceof HttpErrorResponse && error.status === 409
          ? 'Esta conta ja possui uma empresa vinculada. Entre novamente para atualizar a sessao.'
          : 'Nao foi possivel criar a empresa agora. Tente novamente.';
        this.toast.error('Falha ao criar empresa', this.error);
      }
    });
  }

  logout(): void {
    this.auth.logout();
  }
}

