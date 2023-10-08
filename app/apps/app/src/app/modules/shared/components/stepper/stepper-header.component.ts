import { Component, Input } from '@angular/core';

type StepType = number | string;

@Component({
  selector: 'app-stepper-header',
  templateUrl: './stepper-header.component.html',
  styleUrls: ['./stepper-header.component.scss']
})
export class StepperHeaderComponent {

  @Input()
  steps: StepperStep[] = [];

  @Input()
  step: StepType;

  constructor() { }

  getStepDef(step: StepType): StepperStep | null {
    return typeof step === 'number' ? this.getVisibleSteps()[step] : this.steps.find(item => item.id === step);
  }

  getStep() {
    return (this.step || typeof (this.step) === 'number') ? this.step : null;
  }

  setStep(step: StepType) {
    this.step = this.isValidStep(step) ? step : null;
  }

  isCurrentStep(step: StepType): boolean {
    return this.getStepDef(step) === this.getStepDef(this.step);
  }

  isPastStep(step: StepType): boolean {
    return this.steps.findIndex(cStep => cStep === this.getStepDef(this.step)) > this.steps.findIndex(cStep => cStep === this.getStepDef(step));
  }

  isValidStep(step: StepType): boolean {
    return !!this.getStepDef(step);
  }

  getVisibleSteps(): StepperStep[] {
    return this.steps.filter(step => !!step.title);
  }

  isVisibleStep(step: StepType): boolean {
    const stepDef = this.getStepDef(step);
    return stepDef ? !!stepDef.title : false;
  }

}

export interface StepperStep {
  id: string;
  title?: string;
  icon?: string;
  iconStyle?: { [k: string]: string };
  hidden?: boolean;
}
