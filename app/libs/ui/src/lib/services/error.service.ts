import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandler, Injectable } from '@angular/core';
import { environment } from '@app/shared/environments';
import * as Sentry from '@sentry/browser';
import { RewriteFrames } from '@sentry/integrations';

@Injectable({
  providedIn: 'root',
})
export class ErrorService implements ErrorHandler {

  constructor() {
    Sentry.init({
      dsn: environment.sentryDsn,
      release: environment.version,

      // TryCatch has to be configured to disable XMLHttpRequest wrapping, as we are going to handle
      // http module exceptions manually in Angular's ErrorHandler and we don't want it to capture the same error twice.
      integrations: [
        new Sentry.Integrations.TryCatch({
          XMLHttpRequest: false,
        }),
        new RewriteFrames({
          root: '/',
        }),
      ],
    });
  }

  handleError(error: any) {
    if (environment.production) {
      Sentry.captureException(this.extractError(error));
    }

    // Use default error handler when not in production mode
    return (new ErrorHandler()).handleError(error);
  }

  // ---

  private extractError(error: any) {
    // Handle messages and Error objects directly.
    if (typeof error === 'string' || error instanceof Error) {
      return error;
    }

    // If it's http module error, extract as much information from it as we can
    if (error instanceof HttpErrorResponse) {

      // The `error` property of http exception can be either an `Error` object, which we can use directly...
      if (error.error instanceof Error) {
        return error.error;
      }

      // ... or an`ErrorEvent`, which can provide us with the message but no stack...
      if (error.error instanceof ErrorEvent) {
        return error.error.message;
      }

      // ...or the request body itself, which we can use as a message instead.
      if (typeof error.error === 'string') {
        return `Server returned code ${ error.status } with body "${ error.error }"`;
      }

      // TODO: Ignore 401/403

      // If we don't have any detailed information, fallback to the request message itself.
      return error.message;
    }

    return null;
  }
}
