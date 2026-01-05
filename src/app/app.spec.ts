import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { AuthService } from './services/auth/auth.service';
import { App } from './app';

describe('App', () => {
  let routerEvents$: Subject<NavigationEnd>;
  let routerStub: { url: string; events: Subject<NavigationEnd> };

  beforeEach(async () => {
    routerEvents$ = new Subject<NavigationEnd>();
    routerStub = {
      url: '/dashboard',
      events: routerEvents$
    };

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: routerStub },
        {
          provide: AuthService,
          useValue: {
            logout: jest.fn(),
            getUserDisplayName: jest.fn().mockReturnValue('Test User'),
            getUserInitials: jest.fn().mockReturnValue('TU')
          }
        }
      ]
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render wrapper shell for protected routes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('vyracare-wrapper')).not.toBeNull();
  });

  it('should show router outlet only on auth routes', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    routerStub.url = '/login';
    routerEvents$.next(new NavigationEnd(1, '/login', '/login'));
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('vyracare-wrapper')).toBeNull();
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });
});
