import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private tokenKey = 'jwtToken';
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private router: Router) {}

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(data: { fullName?: string; email: string; password: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.router.navigate(['/login']);
  }

  saveToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  private readJwtPayload(token: string): Record<string, unknown> | null {
    try {
      const [, payloadPart] = token.split('.');
      if (!payloadPart) {
        return null;
      }

      const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
      const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
      const payload = JSON.parse(atob(padded));
      return payload as Record<string, unknown>;
    } catch {
      return null;
    }
  }

  private getJwtPayload(): Record<string, unknown> | null {
    const token = this.getToken();
    return token ? this.readJwtPayload(token) : null;
  }

  getUserDisplayName(): string {
    const payload = this.getJwtPayload();
    const rawName = (payload?.['fullName'] as string | undefined);

    if (typeof rawName === 'string' && rawName.trim()) {
      return rawName.trim();
    }

    const email = payload?.['email'];
    if (typeof email === 'string' && email.trim()) {
      return email.trim();
    }

    return 'Usuario';
  }

  getUserInitials(): string {
    return this.buildInitials(this.getUserDisplayName());
  }

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = this.readJwtPayload(token);
      const exp = Number(payload?.['exp']) * 1000;

      if (!Number.isFinite(exp) || Date.now() > exp) {
        this.logout();
        return false;
      }
      return true;
    } catch {
      this.logout();
      return false;
    }
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private buildInitials(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return 'U';

    const cleaned = trimmed.includes('@') ? trimmed.split('@')[0] : trimmed;
    const parts = cleaned.split(/[\s._-]+/).filter(Boolean);
    if (!parts.length) return 'U';

    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }

    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
}
