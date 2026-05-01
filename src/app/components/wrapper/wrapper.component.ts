import { ChangeDetectionStrategy, Component, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet, type Route } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  VcNavbarComponent,
  VcSidebarComponent,
  type VcNavbarAction,
  type VcNotificationItem,
  type VcSidebarGroup,
  type VcSidebarItem,
  type VcSidebarSupport
} from '@vyracare/design-system';

import { AuthService } from '../../services/auth/auth.service';

type ShellSidebarBlueprint = {
  label: string;
  items: Array<{
    path: string;
    label: string;
    icon: string;
  }>;
};

const SHELL_SIDEBAR_BLUEPRINT: ShellSidebarBlueprint[] = [
  {
    label: 'Area Clinica',
    items: [
      { path: 'dashboard', label: 'Dashboard', icon: 'grid-1x2' },
      { path: 'cadastro/pacientes', label: 'Pacientes', icon: 'people' }
    ]
  },
  {
    label: 'Cadastros',
    items: [
      { path: 'cadastro/funcionarios', label: 'Funcionarios', icon: 'person-badge' }
    ]
  }
];

@Component({
  selector: 'vyracare-wrapper',
  standalone: true,
  imports: [CommonModule, RouterOutlet, VcNavbarComponent, VcSidebarComponent],
  templateUrl: './wrapper.component.html',
  styleUrls: ['./wrapper.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WrapperComponent {
  /** Notifications displayed in the shell header. */
  protected readonly notifications: VcNotificationItem[] = [
    {
      id: 'agenda',
      title: 'Agenda de hoje',
      description: 'Voce possui 8 atendimentos confirmados.'
    },
    {
      id: 'financeiro',
      title: 'Financeiro',
      description: '3 boletos aguardando confirmacao.'
    },
    {
      id: 'suporte',
      title: 'Suporte',
      description: 'Novo chamado respondido por nossa equipe.'
    }
  ];
  /** Profile actions rendered in the shell dropdown. */
  protected readonly profileActions: VcNavbarAction[] = [{ id: 'logout', label: 'Sair' }];
  /** Support card shown at the bottom of the sidebar. */
  protected readonly sidebarSupport: VcSidebarSupport = {
    title: 'Precisa de ajuda?',
    description: 'Nossa equipe esta pronta para apoiar sua operacao.',
    linkLabel: 'suporte@vyracare.com',
    linkHref: 'mailto:suporte@vyracare.com'
  };
  protected readonly userDisplayName: string;
  protected readonly userInitials: string;
  protected readonly searchValue = signal('');
  protected readonly currentUrl = signal('/');
  protected readonly sidebarGroups: VcSidebarGroup[];

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    destroyRef: DestroyRef
  ) {
    this.userDisplayName = this.authService.getUserDisplayName();
    this.userInitials = this.authService.getUserInitials();
    this.sidebarGroups = this.buildSidebarGroups(this.router.config);
    this.syncCurrentUrl();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef)
      )
      .subscribe(() => this.syncCurrentUrl());
  }

  /** Active sidebar item derived from the current route tree. */
  protected get activeSidebarItemId(): string {
    const currentPath = this.currentUrl();
    const activeItem = this.sidebarGroups
      .flatMap((group) => group.items)
      .find((item) => currentPath === item.id || currentPath.startsWith(`${item.id}/`));

    return activeItem?.id ?? '';
  }

  /** Keeps the search field state in sync with the navbar output. */
  handleSearchChange(value: string): void {
    this.searchValue.set(value);
  }

  /** Confirms the search interaction and keeps the latest term visible. */
  handleSearchSubmit(value: string): void {
    this.searchValue.set(value);
  }

  /** Routes the user to the application root, which redirects to the dashboard. */
  navigateToRoot(): void {
    void this.router.navigateByUrl('/');
  }

  /** Routes the user according to the selected sidebar item. */
  selectSidebarItem(item: VcSidebarItem): void {
    void this.router.navigateByUrl(`/${item.id}`);
  }

  /** Executes shell profile actions. */
  handleProfileAction(action: VcNavbarAction): void {
    if (action.id === 'logout') {
      this.authService.logout();
    }
  }

  /** Filters the configured routes to only expose screens that exist in the current shell. */
  private buildSidebarGroups(routes: Route[] = []): VcSidebarGroup[] {
    return SHELL_SIDEBAR_BLUEPRINT
      .map((group) => ({
        label: group.label,
        items: group.items
          .filter((item) => routes.some((route) => route.path === item.path))
          .map((item) => ({
            id: item.path,
            label: item.label,
            icon: item.icon
          }))
      }))
      .filter((group) => group.items.length > 0);
  }

  /** Normalizes the current URL so sidebar matching stays stable. */
  private syncCurrentUrl(): void {
    this.currentUrl.set(this.router.url.split('?')[0]);
  }
}
