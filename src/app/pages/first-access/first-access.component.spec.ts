import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { FirstAccessComponent } from './first-access.component';

describe('FirstAccessComponent', () => {
  let authService: jest.Mocked<AuthService>;
  let navigateMock: jest.Mock;

  beforeEach(async () => {
    authService = {
      checkFirstAccess: jest.fn(),
      setFirstAccessPassword: jest.fn()
    } as unknown as jest.Mocked<AuthService>;
    navigateMock = jest.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [FirstAccessComponent],
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
    const fixture = TestBed.createComponent(FirstAccessComponent);

    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not validate email when email form is invalid', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;

    component.checkEmail();

    expect(authService.checkFirstAccess).not.toHaveBeenCalled();
  });

  it('should allow password setup when email exists and can set password', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(of({ exists: true, canSetPassword: true }));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();

    expect(authService.checkFirstAccess).toHaveBeenCalledWith('user@example.com');
    expect(component.canSetPassword()).toBe(true);
    expect(component.emailForm.get('email')?.disabled).toBe(true);
    expect(component.loading()).toBe(false);
  });

  it('should show an error when email does not exist', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(of({ exists: false, canSetPassword: false }));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();

    expect(component.error()).toContain('Email nao encontrado');
    expect(component.canSetPassword()).toBe(false);
  });

  it('should show an error when password is already defined', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(of({ exists: true, canSetPassword: false }));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();

    expect(component.error()).toContain('Senha ja definida');
  });

  it('should handle email validation errors', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(throwError(() => new Error('network')));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();

    expect(component.error()).toContain('Falha ao validar');
    expect(component.loading()).toBe(false);
  });

  it('should keep email control toggle safe when the control is missing', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    const getSpy = jest.spyOn(component.emailForm, 'get').mockReturnValue(null);

    (
      component as unknown as { setEmailControlEnabled(enabled: boolean): void }
    ).setEmailControlEnabled(false);

    expect(getSpy).toHaveBeenCalledWith('email');
  });

  it('should normalize missing email values before first access validation', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    const emailControl = component.emailForm.get('email');
    authService.checkFirstAccess.mockReturnValue(of({ exists: false, canSetPassword: false }));

    emailControl?.clearValidators();
    emailControl?.setValue(null);
    emailControl?.updateValueAndValidity();
    component.checkEmail();

    expect(authService.checkFirstAccess).toHaveBeenCalledWith('');
  });

  it('should not set password before an email is validated', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;

    component.passwordForm.setValue({ password: 'secret1' });
    component.setPassword();

    expect(authService.setFirstAccessPassword).not.toHaveBeenCalled();
  });

  it('should set password after successful email validation', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(of({ exists: true, canSetPassword: true }));
    authService.setFirstAccessPassword.mockReturnValue(of({}));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();
    component.passwordForm.setValue({ password: 'secret1' });
    component.setPassword();

    expect(authService.setFirstAccessPassword).toHaveBeenCalledWith('user@example.com', 'secret1');
    expect(component.success()).toBe(true);
    expect(component.canSetPassword()).toBe(false);
    expect(component.emailForm.get('email')?.enabled).toBe(true);
  });

  it('should handle set password errors', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(of({ exists: true, canSetPassword: true }));
    authService.setFirstAccessPassword.mockReturnValue(throwError(() => ({ error: 'Falha' })));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();
    component.passwordForm.setValue({ password: 'secret1' });
    component.setPassword();

    expect(component.error()).toBe('Falha');
    expect(component.loading()).toBe(false);
  });

  it('should use fallback message when set password error has no backend message', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);
    const component = fixture.componentInstance;
    authService.checkFirstAccess.mockReturnValue(of({ exists: true, canSetPassword: true }));
    authService.setFirstAccessPassword.mockReturnValue(throwError(() => ({})));

    component.emailForm.setValue({ email: 'user@example.com' });
    component.checkEmail();
    component.passwordForm.setValue({ password: 'secret1' });
    component.setPassword();

    expect(component.error()).toContain('Falha ao definir');
  });

  it('should navigate to login', () => {
    const fixture = TestBed.createComponent(FirstAccessComponent);

    fixture.componentInstance.goToLogin();

    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });
});
