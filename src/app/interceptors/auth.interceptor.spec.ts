import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  function runInterceptor(request: HttpRequest<unknown>, handler: HttpHandlerFn) {
    return AuthInterceptor(request, handler);
  }

  it('should append the Authorization header when a token exists', (done) => {
    localStorage.setItem('jwtToken', 'abc123');
    const request = new HttpRequest('GET', '/test');

    let intercepted: HttpRequest<unknown> | null = null;
    const handler: HttpHandlerFn = (req) => {
      intercepted = req;
      return of(new HttpResponse({ status: 200 }));
    };

    runInterceptor(request, handler).subscribe(() => {
      expect(intercepted).not.toBeNull();
      expect(intercepted?.headers.get('Authorization')).toBe('Bearer abc123');
      localStorage.removeItem('jwtToken');
      done();
    });
  });

  it('should forward the original request when there is no token', (done) => {
    localStorage.removeItem('jwtToken');
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
