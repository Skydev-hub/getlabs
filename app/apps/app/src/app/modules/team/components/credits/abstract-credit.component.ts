import {Observable} from 'rxjs';

export interface CreditComponent<T> {
  confirmCreditOperation: () => Observable<T>;
}
