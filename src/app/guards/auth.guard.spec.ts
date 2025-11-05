import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authService: jest.Mocked<AuthService>;
  let navigateMock: jest.Mock;

  beforeEach(() => {
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

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: Router, useValue: { navigate: navigateMock } as Partial<Router> }
      ]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow navigation when user is logged in', () => {
    authService.isLoggedIn.mockReturnValue(true);

    const canActivate = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

    expect(canActivate).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should redirect to login when user is not logged in', () => {
    authService.isLoggedIn.mockReturnValue(false);

    const canActivate = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

    expect(canActivate).toBe(false);
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });
});
