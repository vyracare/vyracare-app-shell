import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VcButtonComponent, VcHeadingComponent, VcTextComponent } from '@vyracare/design-system';

@Component({
  selector: 'vyracare-error',
  standalone: true,
  imports: [CommonModule, VcButtonComponent, VcHeadingComponent, VcTextComponent],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  @Input() title = 'Ops! Algo deu errado';
  @Input() description = 'Nao conseguimos carregar esta parte do aplicativo. Tente novamente em instantes.';

  reload() {
    window.location.reload();
  }
}
