import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { routes } from '../../app.routes';
import { WrapperComponent } from './wrapper.component';

describe('WrapperComponent', () => {
  let authServiceMock: {
    logout: jest.Mock;
    getUserDisplayName: jest.Mock;
    getUserInitials: jest.Mock;
    getUserAccessLevel: jest.Mock;
  };
  let router: Router;

  beforeEach(async () => {
    authServiceMock = {
      logout: jest.fn(),
      getUserDisplayName: jest.fn().mockReturnValue('Test User'),
      getUserInitials: jest.fn().mockReturnValue('TU'),
      getUserAccessLevel: jest.fn().mockReturnValue('Administrador')
    };

    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should render the shell with navbar, sidebar and outlet', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('vc-navbar')).not.toBeNull();
    expect(compiled.querySelector('vc-sidebar')).not.toBeNull();
    expect(compiled.querySelector('.shell-main')).not.toBeNull();
  });

  it('should expose the user data from the auth service', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    expect(component['userDisplayName']).toBe('Test User');
    expect(component['userInitials']).toBe('TU');
    expect(component['userAccessLevel']).toBe('Administrador');
  });

  it('should host a router outlet inside the main area', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const outlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(outlet).not.toBeNull();
  });

  it('should build sidebar groups from available routes', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const groups = component['sidebarGroups'] as Array<{ items: Array<{ id: string }> }>;

    expect(groups.length).toBe(2);
    expect(groups[0].items.map((item) => item.id)).toEqual(['dashboard', 'dashboard/agenda', 'pacientes']);
    expect(groups[1].items.map((item) => item.id)).toEqual(['cadastro/funcionarios', 'cadastro/procedimentos']);
  });

  it('should navigate to root and selected sidebar routes', async () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const navigateSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.navigateToRoot();
    component.selectSidebarItem({ id: 'dashboard', label: 'Dashboard' });

    expect(navigateSpy).toHaveBeenNthCalledWith(1, '/');
    expect(navigateSpy).toHaveBeenNthCalledWith(2, '/dashboard');
  });

  it('should open and close the responsive navigation drawer', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.toggleMobileMenu();
    fixture.detectChanges();

    expect(component['mobileMenuOpen']()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.shell-sidebar')?.classList).toContain('is-open');
    expect((fixture.nativeElement as HTMLElement).querySelector('.mobile-menu-trigger')).toBeNull();

    component.handleEscape();
    fixture.detectChanges();

    expect(component['mobileMenuOpen']()).toBe(false);
    const menuTrigger = (fixture.nativeElement as HTMLElement).querySelector('.mobile-menu-trigger');
    expect(menuTrigger).not.toBeNull();
    expect(menuTrigger?.getAttribute('aria-label')).toBe('Abrir menu de navegacao');
    expect(menuTrigger?.textContent?.trim()).toBe('');
  });

  it('should call logout when the logout profile action is selected', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.handleProfileAction({ id: 'logout', label: 'Sair' });

    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
