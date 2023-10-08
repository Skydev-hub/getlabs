import { Component, Inject, Optional, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConfigurationService, InlineTemplateManagerDirective, InterAppUrlPipe, OptInComponent, OptInComponentState, OptInResult, OptInType } from '@app/ui';

export interface FirstVisitOptInDialogData {
  isLeaving: boolean;
}

@Component({
  selector: 'app-first-visit-opt-in-dialog',
  templateUrl: './first-visit-opt-in-dialog.component.html',
  styleUrls: ['./first-visit-opt-in-dialog.component.scss'],
})
export class FirstVisitOptInDialogComponent {
  public OptInComponentState = OptInComponentState;

  public ButtonTexts: { [key in OptInComponentState]?: string } = {
    [OptInComponentState.Unauthenticated]: 'Get my 10% Off Code',
    [OptInComponentState.Complete]: 'Book Now',
  };

  public result: OptInResult;

  public OptInType = OptInType;

  @ViewChild(OptInComponent, { static: true })
  public optInComponent: OptInComponent;

  @ViewChild(InlineTemplateManagerDirective, { static: true })
  public tplManager: InlineTemplateManagerDirective;

  constructor(@Inject(MAT_DIALOG_DATA) @Optional() public readonly dialogData: FirstVisitOptInDialogData, private readonly config: ConfigurationService) {}

  invokeAction(state: OptInComponentState) {
    /* If we are dealing with an authenticated case, we can route the user to the booking flow... The other cases defer handling
     * to the child component. */
    if (state === OptInComponentState.Complete) {
      window.location.href = new InterAppUrlPipe(this.config).transform('book', 'app');
      return;
    }

    this.optInComponent.invokeAction(state);
  }

  onOptIn(result: OptInResult) {
    this.result = result;
  }
}
