import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router, private toastr: ToastrService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err: HttpErrorResponse) => {

        switch (err.status) {
          case 401:
            // TODO: Intelligently redirect to appropriate sign in page
            // TODO: Do not redirect on JWT black listed routes that can return 401 on authentication failure
            break;
          case 403:
            break;
          case 429:
            this.toastr.error(`Oops! Too many requests at once. Please try again later.`);
            break;
          case 500:
            this.toastr.error(`Oops! We were unable to process your request. Please try again later. Error Message: ${ err.error.message }`);
            break;
          case 502:
            break;
        }

        return throwError(err);
      })
    );
  }

}
