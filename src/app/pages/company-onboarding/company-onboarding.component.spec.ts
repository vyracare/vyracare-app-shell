import { provideZonelessChangeDetection } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { CompanyOnboardingComponent } from './company-onboarding.component';

describe('CompanyOnboardingComponent', () => {
  let auth: jest.Mocked<AuthService>;
  let navigate: jest.Mock;

  beforeEach(async () => {
    auth = {
      createOrganization: jest.fn(),
      saveToken: jest.fn(),
      logout: jest.fn()
    } as unknown as jest.Mocked<AuthService>;
    navigate = jest.fn().mockResolvedValue(true);
    await TestBed.configureTestingModule({
      imports: [CompanyOnboardingComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: auth },
        { provide: Router, useValue: { navigate } }
      ]
    }).compileComponents();
  });

  it('does not submit an invalid form', () => {
    const component = TestBed.createComponent(CompanyOnboardingComponent).componentInstance;
    component.submit();
    expect(auth.createOrganization).not.toHaveBeenCalled();
  });

  it('creates the company, saves the tenant token and opens the dashboard', () => {
    const component = TestBed.createComponent(CompanyOnboardingComponent).componentInstance;
    auth.createOrganization.mockReturnValue(of({ token: 'owner-token' }));
    component.form.setValue({ legalName: 'Clinica A', tradeName: '', document: '' });

    component.submit();

    expect(auth.createOrganization).toHaveBeenCalledWith({ legalName: 'Clinica A', tradeName: undefined, document: undefined });
    expect(auth.saveToken).toHaveBeenCalledWith('owner-token');
    expect(navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('shows a session error when the response has no token', () => {
    const component = TestBed.createComponent(CompanyOnboardingComponent).componentInstance;
    auth.createOrganization.mockReturnValue(of({}));
    component.form.setValue({ legalName: 'Clinica A', tradeName: '', document: '' });
    component.submit();
    expect(component.error).toContain('sessao');
  });

  it('explains when the account already has a company', () => {
    const component = TestBed.createComponent(CompanyOnboardingComponent).componentInstance;
    auth.createOrganization.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 409 })));
    component.form.setValue({ legalName: 'Clinica A', tradeName: '', document: '' });
    component.submit();
    expect(component.error).toContain('ja possui');
  });

  it('uses a safe fallback and supports logout', () => {
    const component = TestBed.createComponent(CompanyOnboardingComponent).componentInstance;
    auth.createOrganization.mockReturnValue(throwError(() => new Error('network')));
    component.form.setValue({ legalName: 'Clinica A', tradeName: '', document: '' });
    component.submit();
    expect(component.error).toContain('Tente novamente');
    component.logout();
    expect(auth.logout).toHaveBeenCalled();
  });
});
