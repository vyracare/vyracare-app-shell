import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  let authService: jest.Mocked<AuthService>;

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
      providers: [{ provide: AuthService, useValue: authService }]
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  function runInterceptor(request: HttpRequest<unknown>, handler: HttpHandlerFn) {
    return TestBed.runInInjectionContext(() => AuthInterceptor(request, handler));
  }

  it('should append the Authorization header when a token exists', (done) => {
    authService.getToken.mockReturnValue('abc123');
    const request = new HttpRequest('GET', '/test');

    let intercepted: HttpRequest<unknown> | null = null;
    const handler: HttpHandlerFn = (req) => {
      intercepted = req;
      return of(new HttpResponse({ status: 200 }));
    };

    runInterceptor(request, handler).subscribe(() => {
      expect(intercepted).not.toBeNull();
      expect(intercepted?.headers.get('Authorization')).toBe('Bearer abc123');
      done();
    });
  });

  it('should forward the original request when there is no token', (done) => {
    authService.getToken.mockReturnValue(null);
    const request = new HttpRequest('GET', '/test');

    let intercepted: HttpRequest<unknown> | null = null;
    const handler: HttpHandlerFn = (req) => {
      intercepted = req;
      return of(new HttpResponse({ status: 200 }));
    };

    runInterceptor(request, handler).subscribe(() => {
      expect(intercepted).not.toBeNull();
      expect(intercepted?.headers.has('Authorization')).toBe(false);
      done();
    });
  });
});
