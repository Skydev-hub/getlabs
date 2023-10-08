import { Component, EventEmitter, Host, Input, Optional, Output, ViewChild } from '@angular/core';
import { ExpansionPanelComponent } from '../../../../../../../../libs/ui/src/lib/components/expansion-panel/expansion-panel.component';
import { StepIndexerDirective } from '../../directives/step-indexer.directive';

@Component({
  selector: 'app-appointment-step',
  templateUrl: './appointment-step.component.html',
  styleUrls: ['./appointment-step.component.scss']
})
export class AppointmentStepComponent {

  @Input()
  completed: boolean = false;

  @Input()
  disabled: boolean = false;

  @Output()
  closed: EventEmitter<void> = new EventEmitter<void>();

  @Output()
  opened: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild(ExpansionPanelComponent, { static: true })
  panel: ExpansionPanelComponent;

  constructor(@Host() @Optional() private readonly stepIndexer: StepIndexerDirective) {}

  open() {
    this.panel.open();
  }

  close() {
    this.panel.close();
  }

  toggle() {
    this.panel.toggle();
  }

  getStepNumber(): string {
    const stepIndex = this.stepIndexer && this.stepIndexer.getStepIndex(this);
    return typeof stepIndex === 'number' ? '' + (stepIndex + 1) : null;
  }

}
