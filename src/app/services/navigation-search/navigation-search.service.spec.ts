import { TestBed } from '@angular/core/testing';

import { NavigationSearchService } from './navigation-search.service';

describe('NavigationSearchService', () => {
  let service: NavigationSearchService;

  beforeEach(() => {
    localStorage.clear();
    service = TestBed.inject(NavigationSearchService);
  });

  it('finds destinations ignoring accents and case', () => {
    expect(service.search('FUNCIONARIO').map((item) => item.id)).toEqual(['employees', 'new-employee']);
  });

  it('finds destinations by synonyms and applies the result limit', () => {
    expect(service.search('cadastro', 2)).toHaveLength(2);
    expect(service.search('prontuario')[0].id).toBe('patients');
  });

  it('returns no destination for an empty or unknown query', () => {
    expect(service.search('   ')).toEqual([]);
    expect(service.search('inexistente')).toEqual([]);
  });

  it('resolves destinations by their stable identifier', () => {
    expect(service.findById('new-patient')?.path).toBe('/pacientes/cadastro');
    expect(service.findById('unknown')).toBeUndefined();
  });

  it('only exposes finance destinations to authorized tokens', () => {
    expect(service.search('financeiro')).toEqual([]);
    const payload = btoa(JSON.stringify({ job_role: 'Financeiro', access_level: 'Leitura' }));
    localStorage.setItem('jwtToken', `header.${payload}.signature`);
    expect(service.search('financeiro')[0]?.id).toBe('finance');
    localStorage.setItem('jwtToken', 'invalid');
    expect(service.findById('finance')).toBeUndefined();
  });
});
