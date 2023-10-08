import { Directive, Input } from '@angular/core';

export interface MailtoOptions {
  subject?: string;
  body?: string;
}

@Directive({
  selector: '[appMailto]',
  host: {
    '[href]': 'this.getMailtoHref()'
  }
})
export class MailtoDirective {
  @Input('appMailto')
  recipient: string;

  @Input()
  appMailtoOptions: MailtoOptions;

  getMailtoHref(): string {
    const appendices = Object.keys(this.appMailtoOptions || {}).reduce((collector, optionKey) => {
      /* If the current option key has a truthy value, add it to the appendices */
      if (this.appMailtoOptions[optionKey]) {
        collector.push({ optionKey, optionValue: this.appMailtoOptions[optionKey] })
      }

      return collector;
    }, []);

    return `mailto:${ this.recipient || '' }${ appendices.length ? '?' + appendices.reduce((collector, appendix) => {
      return collector + (collector ? '&' : '') + `${ appendix.optionKey }=${ encodeURIComponent(appendix.optionValue) }`;
     }, '') : ''}`;
  }
}
