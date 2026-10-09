import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';

import { SearchResultsComponent } from './search-results.component';

describe('SearchResultsComponent', () => {
  let fixture: ComponentFixture<SearchResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchResultsComponent],
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ActivatedRoute,
          useValue: { queryParamMap: of(convertToParamMap({ q: 'paciente' })) }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchResultsComponent);
    fixture.detectChanges();
  });

  it('renders every matching navigation destination', () => {
    const content = fixture.nativeElement.textContent as string;
    const links = fixture.nativeElement.querySelectorAll('.search-results__item');

    expect(content).toContain('Resultados para “paciente”');
    expect(content).toContain('Pacientes');
    expect(content).toContain('Novo paciente');
    expect(links).toHaveLength(2);
  });
});
