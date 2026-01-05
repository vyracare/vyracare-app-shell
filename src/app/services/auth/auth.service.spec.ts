import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environments';

function createTokenWithOffset(offsetMs: number): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64');
  const payload = Buffer.from(
    JSON.stringify({ exp: Math.floor((Date.now() + offsetMs) / 1000) })
  ).toString('base64');

  return `${header}.${payload}.signature`;
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let navigateMock: jest.Mock;

  beforeEach(() => {
    navigateMock = jest.fn().mockResolvedValue(true);

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: Router, useValue: { navigate: navigateMock } as Partial<Router> }]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
    jest.clearAllMocks();
  });

  it('should perform login request', () => {
    const credentials = { email: 'user@example.com', password: 'secret' };

    service.login(credentials).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/login`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(credentials);
    req.flush({ token: 'any' });
  });

  it('should perform register request', () => {
    const payload = { fullName: 'User Name', email: 'user@example.com', password: 'secret' };

    service.register(payload).subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(payload);
    req.flush({ token: 'any' });
  });

  it('should save and retrieve token', () => {
    service.saveToken('abc');
    expect(service.getToken()).toBe('abc');
    expect(localStorage.getItem('jwtToken')).toBe('abc');
  });

  it('should remove token and navigate on logout', () => {
    service.saveToken('abc');

    service.logout();

    expect(service.getToken()).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });

  it('should return true when token is valid and not expired', () => {
    const token = createTokenWithOffset(60_000);
    service.saveToken(token);

    expect(service.isAuthenticated()).toBe(true);
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it('should logout and return false when token is expired', () => {
    const token = createTokenWithOffset(-60_000);
    service.saveToken(token);

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });

  it('should logout and return false when token is malformed', () => {
    service.saveToken('invalid-token-value');

    expect(service.isAuthenticated()).toBe(false);
    expect(service.getToken()).toBeNull();
    expect(navigateMock).toHaveBeenCalledWith(['/login']);
  });

  it('should reflect login state based on token presence', () => {
    expect(service.isLoggedIn()).toBe(false);

    service.saveToken('abc');
    expect(service.isLoggedIn()).toBe(true);

    service.logout();
    expect(service.isLoggedIn()).toBe(false);
  });
});
