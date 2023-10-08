import { Component, Host, Input } from '@angular/core';
import { FilterCriterion, ListFilterContainerDirective } from '../../../directives/list-filter-container.directive';

@Component({
  selector: 'app-list-filter',
  templateUrl: './list-filter.component.html',
  styleUrls: ['./list-filter.component.scss']
})
export class ListFilterComponent<T, K extends object> {
  @Input()
  criterion: FilterCriterion<T, K>;

  public showOptions: boolean = false;

  constructor(@Host() private listFilterContainer: ListFilterContainerDirective<T, K>) {}

  toggleFilterOption(option: T) {
    this.listFilterContainer.isSet(this.criterion, option) ? this.listFilterContainer.unsetFilterOption(this.criterion, option) :
      this.listFilterContainer.setFilterOption(this.criterion, option);
  }

  isOptionSet(option: T) {
    return this.listFilterContainer.isSet(this.criterion, option);
  }
}
