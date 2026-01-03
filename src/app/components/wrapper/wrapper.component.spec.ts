import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { WrapperComponent } from './wrapper.component';

describe('WrapperComponent', () => {
  let authServiceMock: { logout: jest.Mock };

  beforeEach(async () => {
    authServiceMock = { logout: jest.fn() };

    await TestBed.configureTestingModule({
      imports: [WrapperComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthService, useValue: authServiceMock }
      ]
    }).compileComponents();
  });

  it('should render the layout shell', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.navbar')).not.toBeNull();
    expect(compiled.querySelector('.sidebar')).not.toBeNull();
    expect(compiled.querySelector('.shell-main')).not.toBeNull();
  });

  it('should host a router outlet inside main area', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    fixture.detectChanges();

    const outlet = fixture.debugElement.query(By.directive(RouterOutlet));
    expect(outlet).not.toBeNull();
  });

  it('should toggle the notifications dropdown', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['notificationsOpen']()).toBe(false);

    const button = fixture.debugElement.query(By.css('.notifications'));
    const event = new MouseEvent('click');
    button.triggerEventHandler('click', event);
    fixture.detectChanges();
    expect(component['notificationsOpen']()).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));
    expect(component['notificationsOpen']()).toBe(false);
  });

  it('should toggle the profile menu dropdown', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component['logoMenuOpen']()).toBe(false);

    const button = fixture.debugElement.query(By.css('.profile-menu-trigger'));
    button.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();
    expect(component['logoMenuOpen']()).toBe(true);

    document.dispatchEvent(new MouseEvent('click'));
    expect(component['logoMenuOpen']()).toBe(false);
  });

  it('should call logout from the profile menu', () => {
    const fixture = TestBed.createComponent(WrapperComponent);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('.profile-menu-trigger'));
    button.triggerEventHandler('click', new MouseEvent('click'));
    fixture.detectChanges();

    const menuItem = fixture.debugElement.query(By.css('.profile-dropdown .menu-item'));
    menuItem.triggerEventHandler('click', new MouseEvent('click'));
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(component['logoMenuOpen']()).toBe(false);
  });
});
