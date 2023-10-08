import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentService } from 'apps/app/src/app/modules/shared/services/appointment.service';
import { environment } from 'apps/app/src/environments/environment';
import { from, Observable, Subscription } from 'rxjs';
import { shareReplay, tap } from 'rxjs/operators';
import { formErrorMapping, getFormFieldError, markFormAsTouched, PatientUser } from '@app/ui';
import { AnalyticsService } from '@app/ui';
import { PaymentAdjustmentDto } from '../../../../models/payment-adjustment.dto';
import { PaymentRemittedEvent } from '@app/ui';

@Component({
  selector: 'app-patient-credit-card-form',
  templateUrl: './credit-card-form.component.html',
  styleUrls: ['./credit-card-form.component.scss'],
})
export class CreditCardFormComponent implements OnInit, AfterViewInit {
  @ViewChild('cc', { read: ElementRef })
  private cc: ElementRef;

  @Input()
  public user: PatientUser;

  @Input()
  public bookingKey: string;

  @Input()
  public isCreditPermitted: boolean = true;

  @Output()
  ready: EventEmitter<PaymentAdjustmentDto> = new EventEmitter<PaymentAdjustmentDto>();

  @Output()
  success: EventEmitter<string> = new EventEmitter<string>();

  @Output()
  error: EventEmitter<string> = new EventEmitter<string>();

  public paymentIntent$: Observable<PaymentAdjustmentDto>;

  _paymentIntent: stripe.paymentIntents.PaymentIntent;

  // Stripe element references
  stripe: stripe.Stripe;
  elements: stripe.elements.Elements;
  card: stripe.elements.Element;

  // States
  ccTouched = false;
  ccCompleted = false;
  ccEmpty = true;
  ccError: string;

  form: FormGroup;

  req$: Subscription;

  constructor(private fb: FormBuilder, private http: HttpClient, private appointments: AppointmentService, private analyticsService: AnalyticsService) {
    this.form = fb.group({
      name: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    if (!this.user) {
      throw new TypeError("The input 'user' is required");
    }

    if (!this.bookingKey) {
      throw new TypeError("The input 'bookingKey' is required");
    }

    // Create a payment intent for price of the appointment
    this.paymentIntent$ = this.paymentIntent$ = this.appointments.paymentIntent(this.bookingKey, this.isCreditPermitted).pipe(
      shareReplay(), // Create only one request for every subscription
      tap((result) => {
        this._paymentIntent = result.paymentIntent;
        this.ready.emit(result);
      })
    );
  }

  ngAfterViewInit(): void {
    this.paymentIntent$.subscribe(() => {
      // Create payment elements on next tick because DOM elements it's mounted on don't
      // show up until after the payment intent request completes
      setTimeout(this.createPaymentElements, 0);
    });
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  isValid() {
    markFormAsTouched(this.form);

    if (!this.ccError && !this.ccCompleted) {
      this.ccError = formErrorMapping.required;
    }

    return this.form.valid && this.ccCompleted && !this.ccError;
  }

  submit(): Subscription {
    if (this.isValid()) {
      return from(
        this.stripe.handleCardPayment(this._paymentIntent.client_secret, this.card, {
          save_payment_method: true,
          payment_method_data: {
            billing_details: {
              name: this.form.value.name,
            },
          },
        })
      ).subscribe(
        (pi) => {
          /* If an error is present, throw an exception so this drops into the error block. */
          if (pi.error) {
            this.error.emit(pi.error.message);
            return;
          }

          this.success.emit(pi.paymentIntent.id);

          /* Fire an analytics event indicating the payment submission activity. */
          this.analyticsService.trackEvent(new PaymentRemittedEvent(pi.paymentIntent.amount)).subscribe();
        },
        (err) => this.error.emit(err)
      );
    }
  }

  // ---

  private createPaymentElements = () => {
    this.stripe = Stripe(environment.stripeKey);

    const elementStyles = {
      base: {
        color: '#000000',
        fontSize: '18px',
        // height: '27px',
        lineHeight: '27px',
        // fontWeight: '300',
        fontFamily: 'sofia-pro, sans-serif',
        ':focus': {},
        '::placeholder': {
          fontWeight: '400',
          color: '#767676',
        },
      },
      invalid: {},
    };

    this.elements = this.stripe.elements({
      locale: 'en',
      fonts: [
        {
          cssSrc: 'https://use.typekit.net/rgy4mlc.css',
        },
      ],
    });

    this.card = this.elements.create('card', {
      style: elementStyles,
    });

    this.card.mount(this.cc.nativeElement);

    this.card.on('blur', () => {
      this.ccTouched = true;
      if (!this.ccError && (this.ccEmpty || !this.ccCompleted)) {
        this.ccError = formErrorMapping.required;
      }
    });

    this.card.on('change', (event) => {
      this.ccEmpty = event.empty;
      this.ccCompleted = event.complete;
      this.ccError = event.error ? event.error.message : '';
    });
  };
}
