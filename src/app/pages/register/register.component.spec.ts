import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
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

  it('should call authService.register and navigate to login on submit', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const dto = { fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd' };

    authService.register.mockReturnValue(of({}));

    component.form.setValue(dto);
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
    expect(component.loading).toBe(false);
    expect(component.error).toBeNull();
  });

  it('should handle register errors', () => {
    const fixture = TestBed.createComponent(RegisterComponent);
    const component = fixture.componentInstance;
    const dto = { fullName: 'User Name', email: 'user@example.com', password: 'P@ssw0rd' };
    const backendError = { error: 'Falha' };

    authService.register.mockReturnValue(throwError(() => backendError));

    component.form.setValue(dto);
    component.onSubmit();

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(navigateMock).not.toHaveBeenCalled();
    expect(component.loading).toBe(false);
    expect(component.error).toBe(backendError.error);
  });
});
