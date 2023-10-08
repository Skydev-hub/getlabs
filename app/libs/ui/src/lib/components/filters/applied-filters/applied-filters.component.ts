import { Component, Host } from '@angular/core';
import { FilterCriterion, ListFilterContainerDirective } from '../../../directives/list-filter-container.directive';

@Component({
  selector: 'app-applied-filters',
  templateUrl: './applied-filters.component.html',
  styleUrls: ['./applied-filters.component.scss']
})
export class AppliedFiltersComponent<T, K extends object> {
  constructor(@Host() public readonly listFilterContainerDirective: ListFilterContainerDirective<T, K>) { }

  removeFilterOption(criterion: FilterCriterion<T, K>, option: T) {
    this.listFilterContainerDirective.unsetFilterOption(criterion, option);
  }
}
