import { HttpParams } from '@angular/common/http';
import { Subscription } from 'rxjs';

export const filterFalsy = (value: any) => {
  return value ? Object.keys(value).reduce((result, valueKey) => {
    if (value[valueKey]) {
      result[valueKey] = value[valueKey];
    }

    return result;
  }, {}) : value;
};

/* This one is a little bit of an oddity - the function must be a vanilla JS function so we can use 'this', and we must
 * type narrow this as a Subscription so our compiler doesn't throw a shit fit. */
export const AutoUnsubscribe = function <T = any>(cb?: (value: T) => void) {
  return function(value: T) {
    /* Invoke the supplied callback, if applicable. */
    if (cb) {
      cb(value);
    }

    /* Unsubscribe this subscription. */
    if (this instanceof Subscription) {
      (this as Subscription).unsubscribe();
    }
  };
};

export const filterUndefinedHttpParams = (params: {}): HttpParams => {
  let httpParams: HttpParams = new HttpParams();
  Object.keys(params).forEach(param => {
    if (params[param]) {
      httpParams = httpParams.set(param, params[param]);
    }
  });

  return httpParams;
};

export const popupDownloadDialog = (blob: Blob, name: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;

  /* Same solution used by filesaver.js to ensure compatibility with safari/IE. */
  setTimeout(() => {
    link.click();
  });

  /* As above - this particular timeout is required so that we can defer execution of revokeObjectURL until we are certain that
   * the file has opened in the user's browser... Mobile Safari loads the file in the same browser window as the webapp, thus
   * on mobile safari, if this line is executed at any point after link.click is called, it will cause the PDF to crash.
   * For mobile safari, this call is effectively deferred until it can't be executed at all - which is a moot point,
   * since the app will no longer be active in the browser window in favour of the downloaded file. */
  setTimeout(() => {
    window.URL.revokeObjectURL(url);
  }, 5000);
};
