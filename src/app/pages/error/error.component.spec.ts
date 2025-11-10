import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ErrorComponent } from './error.component';

describe('ErrorComponent', () => {
  let originalLocation: Location;

  beforeEach(async () => {
    originalLocation = window.location;

    await TestBed.configureTestingModule({
      imports: [ErrorComponent],
      providers: [provideZonelessChangeDetection()]
    }).compileComponents();
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation
    });
  });

  it('should render default title and description', () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Ops! Algo deu errado');
    expect(compiled.querySelector('p')?.textContent).toContain('Não conseguimos carregar esta parte do aplicativo');
  });

  it('should allow overriding title and description inputs', () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    const component = fixture.componentInstance;

    component.title = 'Falha no carregamento';
    component.description = 'Não foi possível carregar o módulo remoto.';

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Falha no carregamento');
    expect(compiled.querySelector('p')?.textContent).toContain('Não foi possível carregar o módulo remoto.');
  });

  it('should reload the page when the action button is clicked', () => {
    const reloadMock = jest.fn();

    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...originalLocation, reload: reloadMock }
    });

    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click');

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
