import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { RegisterComponent } from './register.component';

describe('RegisterComponent', () => {
  let authService: jest.Mocked<AuthService>;
  let navigateMock: jest.Mock;

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      register: jest.fn(),
      logout: jest.fn(),
      saveToken: jest.fn(),
      getToken: jest.fn(),
      isAuthenticated: jest.fn(),
      isLoggedIn: jest.fn()
    } as jest.Mocked<AuthService>;
    navigateMock = jest.fn().mockResolvedValue(true);

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
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
    const fixture = TestBed.createComponent(RegisterComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not submit when the form is invalid', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(authService.register).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should provision the company, save the token and navigate to dashboard', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const dto = { fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd', legalName: 'Clinica A', tradeName: '', document: '' };

    authService.register.mockReturnValue(of({ token: 'tenant-token' }));

    component.form.setValue(dto);
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith({
      fullName: dto.fullName,
      email: dto.email,
      password: dto.password,
      organization: { legalName: dto.legalName, tradeName: undefined, document: undefined }
    });
    expect(authService.saveToken).toHaveBeenCalledWith('tenant-token');
    expect(navigateMock).toHaveBeenCalledWith(['/dashboard']);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should navigate to login when a legacy response has no token', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd',
      legalName: 'Clinica A', tradeName: '', document: ''
    });
    authService.register.mockReturnValue(of({}));

    component.onSubmit();

    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });

  it.each([
    ['Organization legal name is required', 'razao social'],
    ['Tenant provisioning failed', 'criar sua empresa'],
    ['Tenant provisioning is unavailable', 'criar sua empresa']
  ])('should translate onboarding error %s', (backendMessage, expectedText) => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    component.form.setValue({
      fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd',
      legalName: 'Clinica A', tradeName: '', document: ''
    });
    authService.register.mockReturnValue(throwError(() => new HttpErrorResponse({
      status: 400,
      error: { message: backendMessage }
    })));

    component.onSubmit();

    expect(component.error).toContain(expectedText);
  });

  it('should handle register errors', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const dto = { fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd', legalName: 'Clinica A', tradeName: '', document: '' };
    const backendError = new HttpErrorResponse({
      status: 409,
      error: { message: 'User already exists' }
    });

    authService.register.mockReturnValue(throwError(() => backendError));

    component.form.setValue(dto);
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(expect.objectContaining({
      email: dto.email,
      organization: expect.objectContaining({ legalName: dto.legalName })
    }));
    expect(navigateMock).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.error).toBe('Ja existe uma conta para este e-mail. Acesse sua conta ou utilize outro e-mail.');
  });

  it('should use fallback message when register error has no backend message', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const dto = { fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd', legalName: 'Clinica A', tradeName: '', document: '' };

    authService.register.mockReturnValue(throwError(() => ({})));

    component.form.setValue(dto);
    component.onSubmit();

    expect(component.error).toContain('Falha no registro');
  });
});
