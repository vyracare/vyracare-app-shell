import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vyracare-error',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './error.component.html',
  styleUrls: ['./error.component.scss']
})
export class ErrorComponent {
  @Input() title = 'Ops! Algo deu errado';
  @Input() description = 'Não conseguimos carregar esta parte do aplicativo. Tente novamente em instantes.';

  reload() {
    window.location.reload();
  }
}
