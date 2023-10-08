import { Component, ContentChild, Input, TemplateRef } from '@angular/core';

export interface ShareParameters {
  [key: string]: string | { value: string; encode: boolean };
}

type ShareActionTypes = 'default' | 'newwindow';

export interface WindowProperties {
  /* Width of the new window to be opened.  Default = 520 */
  width?: number;

  /* Height of the new window to be opened.  Default = 560 */
  height?: number;
}

export interface ShareOptions {
  actionType?: ShareActionTypes;
  actionProperties?: {} | WindowProperties;
}

const ShareOpeners: { [key in ShareActionTypes]: (url: URL, shareOptions: ShareOptions) => void } = {
  /**
   * Default share mode defers to the browser for its preferred method of opening a new window (generally
   * a new tab).
   */
  default: url => window.open(url.toString()),

  /**
   * Forces a new window containing the share URL to be opened.
   */
  newwindow: (url, shareOptions: ShareOptions) => {
    /* Set width/height properties according to the supplied share options. */
    const windowProps: WindowProperties = shareOptions && shareOptions.actionProperties || {};
    window.open(url.toString(), 'newwindow', `width=${ windowProps.width || 520 },height=${ windowProps.height || 560 }`);
  },
};

@Component({
  selector: 'app-share-component',
  templateUrl: './share.component.html',
})
export class ShareComponent {
  @Input()
  public shareUrl: string;

  @Input()
  public shareParameters: ShareParameters;

  @Input()
  public options: ShareOptions;

  @ContentChild(TemplateRef, { static: true })
  public templateRef: TemplateRef<any>;

  share() {
    /* Format via the URL API */
    const shareUrl = new URL(this.shareUrl);

    /* Apply share params... */
    if (this.shareParameters) {
      Object.keys(this.shareParameters).forEach(shareParamKey => {
        /* Longwinded version necessary because the compiler hates indexed types in this case for some reason... */
        const param = this.shareParameters[shareParamKey];
        const formattedParam = typeof param !== 'object' ? { value: param, encode: false } : param;

        if (formattedParam.value) {
          shareUrl.searchParams.append(shareParamKey, formattedParam.encode ? encodeURIComponent(formattedParam.value) :
            formattedParam.value);
        }
      })
    }

    /* How we decide to handle this share action depends on the options' actionType parameter */
    ShareOpeners[(this.options && this.options.actionType) || 'default'](shareUrl, this.options);
  }
}
