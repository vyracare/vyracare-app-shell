import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { AuthService } from '../services/auth/auth.service';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let authService: jest.Mocked<AuthService>;
  let router: Router;

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

    TestBed.configureTestingModule({
      imports: [RouterTestingModule.withRoutes([])],
      providers: [{ provide: AuthService, useValue: authService }]
    });

    router = TestBed.inject(Router);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow navigation when user is authenticated', () => {
    authService.isAuthenticated.mockReturnValue(true);

    const canActivate = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

    expect(canActivate).toBe(true);
  });

  it('should redirect to login when user is not authenticated', () => {
    authService.isAuthenticated.mockReturnValue(false);

    const canActivate = TestBed.runInInjectionContext(() => AuthGuard({} as any, {} as any));

    expect(canActivate).toEqual(router.createUrlTree(['/login']));
  });
});
