import { Injectable } from '@angular/core';
import {
  AppointmentCancelReason,
  AppointmentEntity,
  AppointmentStatus,
  CrudService,
  LabOrderDetailsEntity,
  CrudServiceClass,
  FilePurpose,
  FileProcessorStatusDto
} from '@app/ui';
import { plainToClass } from 'class-transformer';
import { format as formatDate } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PaymentAdjustmentDto } from '../../../models/payment-adjustment.dto';
import { PaymentDto } from '../../../models/payment.dto';
import { Timeslot } from '../../../models/timeslot.dto';

@CrudServiceClass(AppointmentEntity)
@Injectable({
  providedIn: 'root',
})
export class AppointmentService extends CrudService<AppointmentEntity> {

  getResourceType() {
    return AppointmentEntity;
  }

  getResourceEndpoint(): string {
    return 'appointment';
  }

  paymentIntent(key: string, useCredits: boolean = false): Observable<PaymentAdjustmentDto> {
    return this.getHttpClient().post<PaymentAdjustmentDto>(this.getEndpoint('payment-intent'), {
      key,
      useCredits,
    }).pipe(
      map(res => plainToClass(PaymentAdjustmentDto, res)),
    );
  }

  applyCoupon(paymentIntentId: string, coupon: string): Observable<PaymentAdjustmentDto> {
    return this.getHttpClient().post<PaymentAdjustmentDto>(this.getEndpoint('apply-coupon'), {
      paymentIntentId, coupon,
    }).pipe(
      map(res => plainToClass(PaymentAdjustmentDto, res)),
    );
  }

  removeCoupon(paymentIntentId: string): Observable<PaymentAdjustmentDto> {
    return this.getHttpClient().post<PaymentAdjustmentDto>(this.getEndpoint('remove-coupon'), {
      paymentIntentId,
    }).pipe(
      map(res => plainToClass(PaymentAdjustmentDto, res)),
    );
  }

  createFromKey(key: string, labOrderDetails: LabOrderDetailsEntity[], paymentIntentId: string, coupon?: string, isMedicare?: boolean): Observable<AppointmentEntity> {
    return this.getHttpClient().post<AppointmentEntity>(this.getEndpoint('from-key'), {
      key, paymentIntentId, coupon, isMedicare,
      labOrderDetails: labOrderDetails.map(lod => {
        return {
          ...lod,
          labOrderIds: lod.labOrderFiles ? lod.labOrderFiles.map(labOrderFile => labOrderFile.id) : [],
        };
      }),
    }).pipe(
      map(res => plainToClass(AppointmentEntity, res)),
    );
  }

  continueOnMobile(): Observable<void> {
    return this.getHttpClient().post<void>(this.getEndpoint('continue-on-mobile'), null);
  }

  rebook(id: string, key: string): Observable<AppointmentEntity> {
    return this.getHttpClient().post<AppointmentEntity>(this.getEndpoint(`${ id }/rebook`), { key }).pipe(
      map(res => plainToClass(AppointmentEntity, res)),
    );
  }

  availability(dates: Date[], timezone: string): Observable<Timeslot[]> {
    const days = dates.map(date => formatDate(date, 'yyyy-MM-dd')).join(',');
    return this.getHttpClient().get<Timeslot[]>(this.getEndpoint(`availability/${ days }`), { params: { timezone } }).pipe(
      map(res => plainToClass(Timeslot, res)),
    );
  }

  readPayment(id: string): Observable<PaymentDto> {
    return this.getHttpClient().get<PaymentDto>(this.getEndpoint(`${ id }/payment`)).pipe(
      map(res => plainToClass(PaymentDto, res)),
    );
  }

  updateStatus(id: string, status: AppointmentStatus, data?: Partial<AppointmentEntity>): Observable<AppointmentEntity> {
    return this.getHttpClient().patch<AppointmentEntity>(this.getEndpoint(`${ id }/${ status }`), data).pipe(
      map(resp => plainToClass(AppointmentEntity, resp)),
    );
  }

  refund(id: string, reason: string): Observable<PaymentDto> {
    return this.getHttpClient().post<PaymentDto>(this.getEndpoint(`${ id }/refund`), { reason }).pipe(
      map(res => plainToClass(PaymentDto, res)),
    );
  }

  cancel(id: string, reason: AppointmentCancelReason, note?: string): Observable<AppointmentEntity> {
    return this.getHttpClient().patch<AppointmentEntity>(this.getEndpoint(`${ id }/cancel`), { reason, note }).pipe(
      map(res => plainToClass(AppointmentEntity, res)),
    );
  }

  feedback(id: string, feedback: string): Observable<AppointmentEntity> {
    return this.getHttpClient().post<AppointmentEntity>(this.getEndpoint(`${ id }/feedback`), { feedback }).pipe(
      map(res => plainToClass(AppointmentEntity, res)),
    );
  }

  toggleSampleStatus(id: string, sample: number, collected: boolean): Observable<AppointmentEntity> {
    return this.getHttpClient().patch<AppointmentEntity>(this.getEndpoint(`${ id }/sample`), { sample, collected }).pipe(
      map(resp => plainToClass(AppointmentEntity, resp)),
    );
  }

  file(id: string, filePurpose: FilePurpose): Observable<FileProcessorStatusDto> {
    return this.getHttpClient().get(this.getEndpoint(`${ id }/file/${ filePurpose }`)).pipe(
      map(res => plainToClass(FileProcessorStatusDto, res)),
    );
  }

  triggerFileGeneration(id: string, filePurpose: FilePurpose): Observable<FileProcessorStatusDto> {
    return this.getHttpClient().patch(this.getEndpoint(`${ id }/file/${ filePurpose }`), { }).pipe(
      map(res => plainToClass(FileProcessorStatusDto, res)),
    );
  }

  waitForFile(id: string, filePurpose: FilePurpose): Observable<FileProcessorStatusDto> {
    return new Observable(observer => {
      const checkStatus = () => {
        // Stop fetching data if all subscribers have unsubscribed.
        if (observer.closed) {
          return observer.complete();
        }
        this.file(id, filePurpose).subscribe(
          (data) => {
            observer.next(data);
            if (data.generating) {
              setTimeout(() => checkStatus(), 5000);
            } else {
              observer.complete();
            }
          },
          (error) => {
            console.error(error);
            setTimeout(() => checkStatus(), 10000);
          }
        );
      };
      checkStatus();
    });
  }
}
