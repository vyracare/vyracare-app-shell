import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { VcIconComponent, type VcSidebarItem } from '@vyracare/design-system';

@Component({
  selector: 'vyracare-mobile-bottom-navigation',
  standalone: true,
  imports: [VcIconComponent],
  templateUrl: './mobile-bottom-navigation.component.html',
  styleUrls: ['./mobile-bottom-navigation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MobileBottomNavigationComponent {
  @Input({ required: true }) items: VcSidebarItem[] = [];
  @Input() activeItemId = '';
  @Input() menuActive = false;

  @Output() readonly itemSelected = new EventEmitter<VcSidebarItem>();
  @Output() readonly menuRequested = new EventEmitter<void>();
}
