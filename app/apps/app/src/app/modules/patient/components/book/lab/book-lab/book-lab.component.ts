import { Component, OnInit, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { LabOrderDetailsEntity } from '@app/ui';
import { plainToClass } from 'class-transformer';
import { Subscription } from 'rxjs';
import { DeepPartial } from 'ts-essentials';
import { className } from '../../../../../shared/utils/class.utils';
import { BookPageComponent } from '../../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../../services/booking-flow.service';
import { AbstractLabComponent } from '../abstract-lab-component/abstract-lab.component';

@Component({
  templateUrl: './book-lab.component.html',
  styleUrls: ['./book-lab.component.scss']
})
export class BookLabComponent implements OnInit {
  private readonly subscriptions: { [key: string]: Subscription } = {};

  constructor(
    @Optional() private bookPageComponent: BookPageComponent,
    private router: Router,
    private bookingFlow: BookingFlowService
  ) {}

  public ngOnInit(): void {
    this.bookPageComponent.stepper.setStep('step-3');
  }

  private onSubmit(labOrderDetails: DeepPartial<LabOrderDetailsEntity>[]) {
    this.bookingFlow.labOrderDetails = labOrderDetails.map(lod => {
      return plainToClass(LabOrderDetailsEntity, {
        ...lod,
      });
    });
    this.router.navigateByUrl('/book/step-4');
  }

  /**
   * Executed on component initialization in the embedded <router-outlet> - this is responsible for subscribing
   * to the 'submit' output binding, which is part of the common interface of AbstractLabComponent.
   */
  subscribeToSubmit(component: Component) {
    if (component instanceof AbstractLabComponent) {
      this.subscriptions[className(component)] = component.submit.subscribe(labOrderDetails => this.onSubmit(labOrderDetails));
    }
  }

  /**
   * Executed on component destruction in the embedded <router-outlet> - this is responsible for unsubscribing
   * to the 'submit' output binding set above.
   */
  unsubscribeToSubmit(component: Component) {
    if (component instanceof AbstractLabComponent) {
      this.subscriptions[className(component)].unsubscribe();
      delete this.subscriptions[className(component)];
    }
  }
}
