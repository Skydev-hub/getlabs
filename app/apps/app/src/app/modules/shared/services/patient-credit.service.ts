import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ConfigurationService, PatientUser, CreditBalanceDto, CreditEntity, CreditSourceEnum } from '@app/ui';
import { plainToClass } from 'class-transformer';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class PatientCreditService {
  constructor(
    private readonly http: HttpClient,
    private readonly configService: ConfigurationService,
  ) {}

  issueCredit(recipient: PatientUser, amount: number, source: CreditSourceEnum, notes?: string): Observable<CreditEntity> {
    return this.http.post(this._getResourcePath(recipient, 'issue-credit'), {
      amount,
      source,
      notes
    }).pipe(
      map(result => plainToClass(CreditEntity, result)),
    );
  }

  getBalance(user: PatientUser): Observable<number> {
    return this.http.get<CreditBalanceDto>(this._getResourcePath(user)).pipe(
      map(result => result.balance)
    );
  }

  revokeCredit(user: PatientUser, amount: number): Observable<void> {
    return this.http.post<void>(this._getResourcePath(user, 'revoke-credit'), { amount });
  }

  private _getResourcePath(user: PatientUser, path?: string) {
    return this.configService.getApiEndPoint([`patient-credit`, user.id, path].filter(Boolean));
  }
}
