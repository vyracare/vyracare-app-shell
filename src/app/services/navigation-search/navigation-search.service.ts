import { Injectable } from '@angular/core';

import type { NavigationSearchDestination } from '../../models/navigation-search.model';

const NAVIGATION_DESTINATIONS: readonly NavigationSearchDestination[] = [
  {
    id: 'dashboard',
    label: 'Visão geral',
    description: 'Abrir o painel principal da clínica',
    icon: 'grid-1x2',
    path: '/dashboard',
    keywords: ['dashboard', 'inicio', 'indicadores', 'resumo']
  },
  {
    id: 'appointments',
    label: 'Atendimentos',
    description: 'Consultar a agenda de atendimentos',
    icon: 'calendar-event',
    path: '/dashboard/agenda',
    keywords: ['agenda', 'consultas', 'horarios']
  },
  {
    id: 'new-appointment',
    label: 'Novo atendimento',
    description: 'Cadastrar um atendimento na agenda',
    icon: 'calendar-plus',
    path: '/dashboard/agenda/novo',
    keywords: ['agendar', 'cadastrar consulta', 'marcar horario']
  },
  {
    id: 'patients',
    label: 'Pacientes',
    description: 'Consultar pacientes cadastrados',
    icon: 'people',
    path: '/pacientes',
    keywords: ['paciente', 'prontuario', 'clientes']
  },
  {
    id: 'new-patient',
    label: 'Novo paciente',
    description: 'Cadastrar um novo paciente',
    icon: 'person-plus',
    path: '/pacientes/cadastro',
    keywords: ['cadastro paciente', 'adicionar paciente']
  },
  {
    id: 'employees',
    label: 'Funcionários',
    description: 'Consultar funcionários cadastrados',
    icon: 'person-badge',
    path: '/cadastro/funcionarios',
    keywords: ['funcionario', 'equipe', 'profissional', 'colaborador']
  },
  {
    id: 'new-employee',
    label: 'Novo funcionário',
    description: 'Cadastrar um novo funcionário',
    icon: 'person-plus',
    path: '/cadastro/funcionarios/novo',
    keywords: ['cadastro funcionario', 'adicionar profissional']
  },
  {
    id: 'proceedings',
    label: 'Procedimentos',
    description: 'Consultar procedimentos cadastrados',
    icon: 'clipboard2-pulse',
    path: '/cadastro/procedimentos',
    keywords: ['procedimento', 'servico', 'tratamento']
  },
  {
    id: 'new-proceeding',
    label: 'Novo procedimento',
    description: 'Cadastrar um novo procedimento',
    icon: 'clipboard2-plus',
    path: '/cadastro/procedimentos/novo',
    keywords: ['cadastro procedimento', 'adicionar servico']
  },
  {
    id: 'finance',
    label: 'Financeiro',
    description: 'Consultar receitas, despesas e boletos',
    icon: 'cash-coin',
    path: '/financeiro',
    keywords: ['financeiro', 'receita', 'despesa', 'boleto', 'fluxo de caixa']
  },
  {
    id: 'notifications',
    label: 'Notificacoes',
    description: 'Consultar avisos ainda nao lidos',
    icon: 'bell',
    path: '/notificacoes',
    keywords: ['notificacao', 'aviso', 'lembrete']
  }
];

@Injectable({ providedIn: 'root' })
export class NavigationSearchService {
  /** Finds destinations by label, description or configured synonyms. */
  search(query: string, limit?: number): NavigationSearchDestination[] {
    const normalizedQuery = this.normalize(query.trim());
    if (!normalizedQuery) {
      return [];
    }

    const results = this.allowedDestinations().filter((destination) => {
      const searchableContent = [destination.label, destination.description, ...destination.keywords]
        .map((value) => this.normalize(value))
        .join(' ');

      return searchableContent.includes(normalizedQuery);
    });

    return typeof limit === 'number' ? results.slice(0, limit) : results;
  }

  /** Resolves the complete destination selected from the design-system suggestion. */
  findById(id: string): NavigationSearchDestination | undefined {
    return this.allowedDestinations().find((destination) => destination.id === id);
  }

  private allowedDestinations(): readonly NavigationSearchDestination[] {
    return NAVIGATION_DESTINATIONS.filter((destination) => destination.id !== 'finance' || this.hasFinanceReadAccess());
  }

  private hasFinanceReadAccess(): boolean {
    try {
      const part = (localStorage.getItem('jwtToken') ?? '').split('.')[1];
      if (!part) return false;
      const normalized = part.replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '='))) as Record<string, unknown>;
      const oneOf = (claim: string, ...values: string[]) => values.some(value => value.toLocaleLowerCase('pt-BR') === String(payload[claim] ?? '').trim().toLocaleLowerCase('pt-BR'));
      return oneOf('tenant_role', 'Owner', 'Administrator', 'Proprietario', 'Administrador')
        || oneOf('access_level', 'Administrador', 'Gestor')
        || oneOf('job_role', 'Financeiro');
    } catch { return false; }
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }
}
