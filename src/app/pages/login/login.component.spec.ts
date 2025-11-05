import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
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
      imports: [LoginComponent],
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
    const fixture = TestBed.createComponent(LoginComponent);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not submit when the form is invalid', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.onSubmit();

    expect(authService.login).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
  });

  it('should call authService.login and navigate on submit', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const credentials = { email: 'user@example.com', password: 'P@ssw0rd' };

    authService.login.mockReturnValue(of({}));

    component.form.setValue(credentials);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(navigateMock).toHaveBeenCalledWith(['/']);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should handle login errors', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const credentials = { email: 'user@example.com', password: 'P@ssw0rd' };
    const backendError = { error: 'Falha' };

    authService.login.mockReturnValue(throwError(() => backendError));

    component.form.setValue(credentials);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.error).toBe(backendError.error);
  });

  it('should navigate to register page', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.goToRegister();

    expect(navigateMock).toHaveBeenCalledWith(['/register']);
  });
});
