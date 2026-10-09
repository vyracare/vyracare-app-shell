import { ChangeDetectionStrategy, Component, DestroyRef, computed, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VcIconComponent } from '@vyracare/design-system';

import { NavigationSearchService } from '../../services/navigation-search/navigation-search.service';

@Component({
  selector: 'vyracare-search-results',
  standalone: true,
  imports: [RouterLink, VcIconComponent],
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchResultsComponent {
  protected readonly query = signal('');
  protected readonly results = computed(() => this.navigationSearch.search(this.query()));

  constructor(
    route: ActivatedRoute,
    private readonly navigationSearch: NavigationSearchService,
    destroyRef: DestroyRef
  ) {
    route.queryParamMap
      .pipe(takeUntilDestroyed(destroyRef))
      .subscribe((params) => this.query.set(params.get('q')?.trim() ?? ''));
  }
}
