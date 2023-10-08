import { CdkStepper } from '@angular/cdk/stepper';
import { Component } from '@angular/core';

@Component({
  selector: 'app-stepper',
  templateUrl: './stepper.component.html',
  styleUrls: ['./stepper.component.scss'],
  providers: [
    {
      provide: CdkStepper,
      useExisting: StepperComponent,
    }
  ],
})
export class StepperComponent extends CdkStepper {}
