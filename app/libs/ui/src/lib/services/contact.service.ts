import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ContactDto } from '../models/contact.dto';
import { RequestOptions } from '../services/crud.service';
import { ConfigurationService } from './configuration.service';

@Injectable({
  providedIn: 'root',
})
export class ContactService {

  constructor(
    private readonly http: HttpClient,
    private readonly config: ConfigurationService,
  ) {
  }

  send(data: ContactDto, options?: RequestOptions): Observable<null> {
    return this.http.post<null>(this.config.getApiEndPoint('contact'), { ...data }, options);
  }

}
