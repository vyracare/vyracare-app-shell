import { ChangeDetectionStrategy, Component, Inject, InjectionToken, Input } from '@angular/core';

import { VcButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';

export const PAGE_RELOAD = new InjectionToken<() => void>('PAGE_RELOAD', {
  providedIn: 'root',
  factory: () => () => {
    if (typeof window !== 'undefined') window.location.reload();
  }
});

@Component({
  selector: 'vyracare-error',
  standalone: true,
  imports: [VcButtonComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './error.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  @Input() title = 'Ops! Algo deu errado';
  @Input() description = 'Nao conseguimos carregar esta parte do aplicativo. Tente novamente em instantes.';

  constructor(@Inject(PAGE_RELOAD) private readonly reloadPage: () => void) {}

  reload(): void {
    this.reloadPage();
  }
}
