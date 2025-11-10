import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'vyracare-dashboard-unavailable',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard-unavailable.component.html',
  styleUrls: ['./dashboard-unavailable.component.scss']
})
export class DashboardUnavailableComponent {
  retry() {
    window.location.reload();
  }
}
