import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AppointmentEntity, MarketEntity, PagedResponseDto, PatientUser } from '../models';
import { UserCrudService } from './user-crud.service';
import { differenceInYears } from 'date-fns';

const MIN_MINOR_AGE = 5;
const MAX_MINOR_AGE = 17;

@Injectable({
  providedIn: 'root'
})
export class PatientUserService extends UserCrudService<PatientUser> {
  getResourceType() {
    return PatientUser;
  }

  getResourceEndpoint(): string {
    return 'user/patient';
  }

  appointments(user: { id: string }, params?: { [param: string]: string | string[] } | HttpParams): Observable<AppointmentEntity[]> {
    return this.getHttpClient()
      .get<PagedResponseDto<AppointmentEntity[]>>(`${this.getEndpoint()}/${user.id}/appointments`, { params })
      .pipe(map(res => plainToClass(AppointmentEntity, res.data)));
  }

  continueInsuranceOnMobile(user: PatientUser): Observable<void> {
    return this.getHttpClient().post<void>(`${this.getEndpoint()}/${user.id}/continue-insurance-on-mobile`, null);
  }

  updateMarkets(): Observable<MarketEntity[]> {
    throw new Error('Cannot assign patients to markets');
  }

  public isEligibleMinor(dob?: Date): boolean {
    if (!dob) {
      return false;
    }
    const age = differenceInYears(new Date(), dob);
    return age >= MIN_MINOR_AGE && age <= MAX_MINOR_AGE;
  }

  public isMinor(dob?: Date): boolean {
    if (!dob) {
      return false;
    }
    const age = differenceInYears(new Date(), dob);
    return age <= MAX_MINOR_AGE;
  }
}
