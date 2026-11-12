import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter, Router, RouterOutlet } from '@angular/router';

import { AuthService } from '../../services/auth/auth.service';
import { routes } from '../../app.routes';
import { WrapperComponent } from './wrapper.component';
import { NotificationCenterService } from '../../services/notification-center/notification-center.service';
import { of } from 'rxjs';

describe('WrapperComponent', () => {
  let authServiceMock: {
    logout: jest.Mock;
    getUserDisplayName: jest.Mock;
    getUserInitials: jest.Mock;
    getUserAccessLevel: jest.Mock;
    hasFinanceReadAccess: jest.Mock;
  };
  let router: Router;
  const notificationCenterMock = {
    items: signal([]),
    start: jest.fn(),
    stop: jest.fn(),
    markAsRead: jest.fn(() => of(void 0))
  };

  beforeEach(async () => {
    authServiceMock = {
      logout: jest.fn(),
      getUserDisplayName: jest.fn().mockReturnValue('Test User'),
      getUserInitials: jest.fn().mockReturnValue('TU'),
      getUserAccessLevel: jest.fn().mockReturnValue('Administrador'),
      hasFinanceReadAccess: jest.fn().mockReturnValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter(routes),
        { provide: AuthService, useValue: authServiceMock },
        { provide: NotificationCenterService, useValue: notificationCenterMock }
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
    const groups = component['sidebarGroups'] as Array<{
      items: Array<{ id: string; children?: Array<{ id: string }> }>;
    }>;

    expect(groups.length).toBe(3);
    expect(groups[0].items.map((item) => item.id)).toEqual(['dashboard', 'dashboard/agenda', 'pacientes']);
    expect(groups[1].items.map((item) => item.id)).toEqual(['cadastro/funcionarios', 'cadastro/procedimentos']);
    expect(groups[2].items.map((item) => item.id)).toEqual(['financeiro-menu']);
    expect(groups[2].items[0].children?.map((item) => item.id)).toEqual([
      'financeiro',
      'financeiro/recebimentos',
      'financeiro/pagamentos',
      'financeiro/compras',
      'financeiro/movimentacoes'
    ]);
  });

  it('should expose the primary destinations in the mobile navigation', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.mobile-bottom-nav__item > span')
    ).map((element) => element.textContent?.trim());

    expect(labels).toEqual(['Início', 'Agenda', 'Pacientes', 'Menu']);
  });

  it('should navigate and open the complete menu from the mobile bar', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const navigateSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const buttons = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>('.mobile-bottom-nav__item')
    );

    buttons[1].click();
    expect(navigateSpy).toHaveBeenCalledWith('/dashboard/agenda');

    buttons[3].click();
    fixture.detectChanges();

    expect(fixture.componentInstance['mobileMenuOpen']()).toBe(true);
    expect((fixture.nativeElement as HTMLElement).querySelector('.mobile-bottom-nav')).toBeNull();
  });

  it('should prefer the most specific active route', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component['currentUrl'].set('dashboard/agenda/novo');
    expect(component['activeSidebarItemId']).toBe('dashboard/agenda');

    component['currentUrl'].set('cadastro/funcionarios/editar/123');
    expect(component['activeSidebarItemId']).toBe('cadastro/funcionarios');
    expect(component['mobileMenuContainsActiveRoute']).toBe(true);
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

  it('should suggest matching destinations while the user types', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.handleSearchChange('paciente');

    expect(component['searchSuggestions']().map((item) => item.id)).toEqual(['patients', 'new-patient']);
  });

  it('should open the complete search page when Enter is pressed', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const navigateSpy = jest.spyOn(router, 'navigate').mockResolvedValue(true);

    component.handleSearchSubmit(' paciente ');

    expect(navigateSpy).toHaveBeenCalledWith(['/busca'], { queryParams: { q: 'paciente' } });
  });

  it('should navigate directly when an autocomplete suggestion is selected', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;
    const navigateSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    component.handleSearchSuggestion({ id: 'new-patient', label: 'Novo paciente' });
    component.handleSearchSuggestion({ id: 'unknown', label: 'Desconhecido' });

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith('/pacientes/cadastro');
    expect(component['searchValue']()).toBe('');
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
    expect((fixture.nativeElement as HTMLElement).querySelector('.mobile-bottom-nav')).toBeNull();

    component.handleEscape();
    fixture.detectChanges();

    expect(component['mobileMenuOpen']()).toBe(false);
    const menuTrigger = (fixture.nativeElement as HTMLElement).querySelector('.mobile-menu-trigger');
    expect(menuTrigger).not.toBeNull();
    expect(menuTrigger?.getAttribute('aria-label')).toBe('Abrir menu de navegacao');
    expect(menuTrigger?.textContent?.trim()).toBe('');
    expect((fixture.nativeElement as HTMLElement).querySelector('.mobile-bottom-nav')).not.toBeNull();
  });

  it('should call logout when the logout profile action is selected', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const component = fixture.componentInstance;

    component.handleProfileAction({ id: 'logout', label: 'Sair' });

    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(notificationCenterMock.stop).toHaveBeenCalled();
  });

  it('should acknowledge a selected notification and navigate to its route', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();
    const navigateSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);
    const notification = {
      id: 'finance:1', source: 'finance' as const, sourceId: '1', title: 'Boleto',
      description: 'Pendente', route: '/financeiro/boletos', occurredAt: '2026-11-11T12:00:00Z'
    };

    fixture.componentInstance.handleNotification(notification);

    expect(notificationCenterMock.markAsRead).toHaveBeenCalledWith(notification);
    expect(navigateSpy).toHaveBeenCalledWith('/financeiro/boletos');
  });
});
