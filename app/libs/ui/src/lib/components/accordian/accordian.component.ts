import { CdkAccordion } from '@angular/cdk/accordion';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { AfterViewInit, Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges } from '@angular/core';
import { ExpansionPanelComponent } from '@app/ui';
import { BehaviorSubject, Subject } from 'rxjs';

/**
 * @param row Determines whether this accordian will be rendered as a standard vertical accordian (undefined/false), or as a row accordian (true).
 */
@Component({
  selector: 'app-accordian',
  template: '<ng-content></ng-content>',
  styleUrls: ['./accordian.component.scss'],
  host: {
    '[class.app-accordian-row]': 'row',
  },
})
export class AccordianComponent extends CdkAccordion implements OnChanges, AfterViewInit, OnDestroy {
  @Input()
  public row: boolean;

  @Output()
  openPanel: EventEmitter<ExpansionPanelComponent> = new EventEmitter<ExpansionPanelComponent>();

  opened = new BehaviorSubject<ExpansionPanelComponent>(undefined);
  closed = new Subject<ExpansionPanelComponent>();

  currentSlug = new Subject<string>();

  ngOnChanges(changes: SimpleChanges): void {
    this.row = coerceBooleanProperty(changes.row.currentValue);
    this.multi = this.row;
  }

  ngAfterViewInit() {
    this.opened.subscribe(panel => {
      this.openPanel.emit(panel);
    });

    this.closed.subscribe(panel => {
      if (panel === this.opened.getValue()) {
        this.openPanel.emit(null);
      }
    });
  }

  openPanelForSlug(slug: string) {
    this.currentSlug.next(slug);
  }

  ngOnDestroy() {
    super.ngOnDestroy();

    this.openPanel.complete();

    this.opened.complete();
    this.closed.complete();

    this.currentSlug.complete();
  }

}
