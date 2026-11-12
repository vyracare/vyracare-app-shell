import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ErrorComponent, PAGE_RELOAD } from './error.component';

describe('ErrorComponent', () => {
  const reloadMock = jest.fn();

  beforeEach(async () => {
    reloadMock.mockReset();

    await TestBed.configureTestingModule({
      imports: [ErrorComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: PAGE_RELOAD, useValue: reloadMock }
      ]
    }).compileComponents();
  });

  it('should render default title and description', () => {
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('h1')?.textContent).toContain('Ops! Algo deu errado');
    expect(compiled.querySelector('p')?.textContent).toContain('Nao conseguimos carregar esta parte do aplicativo');
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
    const fixture = TestBed.createComponent(ErrorComponent);
    fixture.componentInstance.reload();

    expect(reloadMock).toHaveBeenCalledTimes(1);
  });
});
