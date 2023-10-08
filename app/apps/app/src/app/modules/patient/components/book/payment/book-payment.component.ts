import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, Optional, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import {
  AnalyticsService,
  applyNetworkValidationErrors,
  AuthService,
  CouponEntity,
  getFormFieldError,
  LabCompany,
  PatientUser,
  PatientUserService
} from '@app/ui';
import { CreditCardFormComponent } from 'apps/app/src/app/modules/patient/components/credit-card-form/credit-card-form.component';
import { AppointmentService } from 'apps/app/src/app/modules/shared/services/appointment.service';
import { BehaviorSubject, concat, defer, Observable, of, Subscription } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CouponPaymentAdjustmentData, PaymentAdjustment, PaymentAdjustmentDto, PaymentAdjustmentType } from '../../../../../models/payment-adjustment.dto';
import { Timeslot } from '../../../../../models/timeslot.dto';
import { ErrorDialogComponent } from '../../../../shared/components/dialog/error-dialog/error-dialog.component';
import { BookPageComponent } from '../../../pages/book/book-page.component';
import { BookingFlowService } from '../../../services/booking-flow.service';
import { DeepPartial } from 'ts-essentials';
import { isEmpty } from 'lodash-es';

enum PriceType {
  ORIGINAL,
  FINAL
}

@Component({
  templateUrl: './book-payment.component.html',
  styleUrls: ['./book-payment.component.scss']
})
export class BookPaymentComponent implements OnInit {
  @ViewChild(CreditCardFormComponent, { static: true })
  cc: CreditCardFormComponent;

  form: FormGroup;

  paymentDetails$ = new BehaviorSubject<PaymentAdjustmentDto>(null);

  coupon$ = new BehaviorSubject<CouponEntity>(null);

  req$: Subscription;

  updateUserReq$: Subscription;

  removeCouponReq$: Subscription;

  applyCouponReq$: Subscription;

  error: string;

  PriceType = PriceType;

  LabCompany = LabCompany;

  showCoupon: boolean = false;

  PaymentAdjustmentType = PaymentAdjustmentType;

  constructor(
    @Optional() private bookPageComponent: BookPageComponent,
    private auth: AuthService,
    private dialog: MatDialog,
    private analyticsService: AnalyticsService,
    private patientUserService: PatientUserService,
    private appointmentService: AppointmentService,
    public bookingFlowService: BookingFlowService,
    fb: FormBuilder
  ) {
    this.form = fb.group({
      coupon: null,
      email: [
        this.getUser().email,
        {
          validators: Validators.email,
          updateOn: 'blur'
        }
      ]
    });
  }

  ngOnInit() {
    this.paymentDetails$.subscribe(pi => (this.bookingFlowService.paymentIntentId = pi ? pi.paymentIntent.id : null));
    this.coupon$.subscribe(coupon => (this.bookingFlowService.coupon = coupon ? coupon.code : null));

    /* If destination lab(s) are selected, ensure that the user acknowledges the terms for each lab implicated in the
     * full lab order set. */
    const operations: Observable<boolean>[] = [];

    this.bookingFlowService.labOrderDetails
      .reduce((collector, lod) => {
        /* Only add the lab to the to-be-acknowledged set if it's defined. */
        if (lod.lab) {
          collector.add(lod.lab);
        }

        return collector;
      }, new Set<LabCompany>())
      .forEach(labCompany => operations.push(defer(() => this.bookingFlowService.doAcknowledgements(labCompany))));

    concat(...operations).subscribe();
  }

  applyCoupon(code: string) {
    /* Only possible to apply the coupon if it's present, and if the payment intent has been populated */
    if (!code || !this.paymentDetails$.getValue()) {
      return;
    }

    /* Invoke the apply API endpoint */
    this.applyCouponReq$ = this.appointmentService
      .applyCoupon(this.paymentDetails$.getValue().paymentIntent.id, code)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
          return of(null);
        })
      )
      .subscribe((res: PaymentAdjustmentDto) => {
        if (res) {
          this.paymentDetails$.next(res);

          const adjustment: PaymentAdjustment<CouponPaymentAdjustmentData> = res.adjustments.find(
            trackedAdjustment => trackedAdjustment.type === PaymentAdjustmentType.COUPON
          );
          this.coupon$.next(adjustment && adjustment.data && adjustment.data.coupon);
        }
      });
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  getUser() {
    return this.auth.getUser() as PatientUser;
  }

  getTimeslot(): Timeslot {
    return this.bookingFlowService.timeslot;
  }

  isBookedToLab(labCompany: LabCompany) {
    return !!this.bookingFlowService.labOrderDetails.find(lod => lod.lab === labCompany);

    // return this.bookingFlowService.labOrderDetails.lab === labCompany;
  }

  getPrice(type: PriceType = PriceType.ORIGINAL): number {
    switch (type) {
      default:
      case PriceType.ORIGINAL:
        return this.getTimeslot().price / 100;
      case PriceType.FINAL:
        const pi = this.paymentDetails$.getValue();
        return this.isFree() ? 0 : pi ? pi.paymentIntent.amount / 100 : this.getPrice(PriceType.ORIGINAL);
    }
  }

  isFree(): boolean {
    const pi = this.paymentDetails$.getValue();
    switch (true) {
      case pi &&
        pi.paymentIntent.amount === 50 &&
        pi.adjustments.reduce((collector, adjustment) => {
          collector += adjustment.amount;
          return collector;
        }, 0) >= this.getPrice(PriceType.ORIGINAL):
        return true;
      default:
        return false;
    }
  }

  onReady(pi: PaymentAdjustmentDto) {
    this.paymentDetails$.next(pi);
  }

  onError(message: string) {
    this.dialog.open(ErrorDialogComponent, {
      data: {
        title: 'Payment Error',
        message: message,
        action: 'Try Again'
      }
    });
  }

  removeCoupon() {
    this.removeCouponReq$ = this.appointmentService.removeCoupon(this.paymentDetails$.getValue().paymentIntent.id).subscribe(pi => {
      this.form.patchValue({ coupon: null });
      this.paymentDetails$.next(pi);
      this.coupon$.next(null);
    });
  }

  submit() {
    this.error = null;

    if (this.form.get('email').valid) {
      this.updateUserReq$ = this.updateUser().subscribe(patient => {
        if (patient) {
          if (this.isFree()) {
            this.req$ = this.goToNextStep();
          } else {
            this.req$ = this.cc.submit();
          }
        }
      });
    }
  }

  updateUser(): Observable<PatientUser> {
    const values = <DeepPartial<PatientUser>>{};
    const emailControl = this.form.get('email');
    if (!emailControl.valid) {
      return of(null);
    } else if (emailControl.value) {
      // If email field is blank it is valid but not savable.
      values.email = emailControl.value;
    }
    if (this.bookingFlowService.address) {
      values.address = this.bookingFlowService.address;
    }
    if (isEmpty(values)) {
      // Nothing to update
      return of(this.getUser());
    }
    return this.patientUserService
      .update(this.getUser().id, values)
      .pipe(
        map(value => {
          return value;
        })
      )
      .pipe(
        catchError(error => {
          applyNetworkValidationErrors(this.form, error);
          return of(null);
        })
      );
  }

  goToNextStep(): Subscription {
    return this.bookingFlowService.create().subscribe({
      complete: () => {
        /* Track this as a conversion */
        this.analyticsService.triggerTagManagerEvent('purchase');

        if (this.bookPageComponent) {
          this.bookPageComponent.nextStep();
        }
      }
    });
  }
}
