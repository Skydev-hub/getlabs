import { Directive, Input, QueryList } from '@angular/core';

/**
 * To be used in step-based progression components: this directive provides an interface for step elements to resolve the
 * current step index of a given step.
 */
@Directive({
  selector: '[appStepIndexerDirective]',
})
export class StepIndexerDirective {
  @Input()
  steps: QueryList<any>;

  constructor() {}

  /**
   * Returns the current zero-based step index of the supplied element
   */
  public getStepIndex(step: any) {
    return this.steps && this.steps.toArray().indexOf(step);
  }
}
