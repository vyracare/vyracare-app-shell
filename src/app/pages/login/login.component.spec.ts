import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let authService: jest.Mocked<AuthService>;
  let router: Router;
  let navigateSpy: jest.SpyInstance;

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

    await TestBed.configureTestingModule({
      imports: [LoginComponent, RouterTestingModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authService },
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);
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

  it('should save the token and navigate on submit', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const credentials = { email: 'user@example.com', password: 'P@ssw0rd' };

    authService.login.mockReturnValue(of({ token: 'jwt' }));

    component.form.setValue(credentials);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalledWith(credentials);
    expect(authService.saveToken).toHaveBeenCalledWith('jwt');
    expect(navigateSpy).toHaveBeenCalledWith(['/dashboard']);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should show an error when the response does not contain a token', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;
    const credentials = { email: 'user@example.com', password: 'P@ssw0rd' };

    authService.login.mockReturnValue(of({}));

    component.form.setValue(credentials);
    component.onSubmit();

    expect(authService.login).toHaveBeenCalled();
    expect(authService.saveToken).not.toHaveBeenCalled();
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.error).toContain('Tente novamente');
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
    expect(navigateSpy).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.error).toBe(backendError.error);
  });

  it('should navigate to register page', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.goToRegister();

    expect(navigateSpy).toHaveBeenCalledWith(['/register']);
  });
  it('should navigate to first access page', () => {
    const fixture = TestBed.createComponent(LoginComponent);
    const component = fixture.componentInstance;

    component.goToFirstAccess();

    expect(navigateSpy).toHaveBeenCalledWith(['/first-access']);
  });
});
