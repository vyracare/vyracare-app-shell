import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { ForgotPasswordComponent } from './forgot-password.component';

describe('ForgotPasswordComponent', () => {
  let authService: jest.Mocked<AuthService>;
  let navigateMock: jest.Mock;

  beforeEach(async () => {
    authService = {
      forgotPassword: jest.fn()
    } as unknown as jest.Mocked<AuthService>;
    navigateMock = jest.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [ForgotPasswordComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { navigate: navigateMock } as Partial<Router> }
      ]
    }).compileComponents();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create the component', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not submit when the form is invalid', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(authService.forgotPassword).not.toHaveBeenCalled();
    expect(component.loading()).toBe(false);
  });

  it('should request password reset and reset form on success', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    authService.forgotPassword.mockReturnValue(of({}));

    component.form.setValue({ email: 'user@example.com', password: 'secret1' });
    component.onSubmit();

    expect(authService.forgotPassword).toHaveBeenCalledWith('user@example.com', 'secret1');
    expect(component.success()).toBe(true);
    expect(component.error()).toBeNull();
    expect(component.loading()).toBe(false);
    expect(component.form.value.email).toBeNull();
  });

  it('should normalize missing form values before password reset request', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    const emailControl = component.form.get('email');
    const passwordControl = component.form.get('password');
    authService.forgotPassword.mockReturnValue(of({}));

    emailControl?.clearValidators();
    passwordControl?.clearValidators();
    component.form.setValue({ email: null, password: null });
    emailControl?.updateValueAndValidity();
    passwordControl?.updateValueAndValidity();
    component.onSubmit();

    expect(authService.forgotPassword).toHaveBeenCalledWith('', '');
  });

  it('should show backend error when password reset fails', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    authService.forgotPassword.mockReturnValue(throwError(() => ({ error: 'Falha' })));

    component.form.setValue({ email: 'user@example.com', password: 'secret1' });
    component.onSubmit();

    expect(component.error()).toBe('Falha');
    expect(component.success()).toBe(false);
    expect(component.loading()).toBe(false);
  });

  it('should use fallback error when backend message is missing', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);
    const component = fixture.componentInstance;
    authService.forgotPassword.mockReturnValue(throwError(() => ({})));

    component.form.setValue({ email: 'user@example.com', password: 'secret1' });
    component.onSubmit();

    expect(component.error()).toContain('Falha ao atualizar');
  });

  it('should navigate to login', () => {
    const fixture = TestBed.createComponent(ForgotPasswordComponent);

    fixture.componentInstance.goToLogin();

    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });
});
