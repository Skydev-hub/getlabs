import { Directive, HostListener, Input, Type } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Directive({
  selector: 'button[appModalLaunch]',
})
export class ModalAnchorDirective {
  @Input()
  dialog: Type<any>;

  @Input()
  panelClass: string;

  constructor(private readonly matDialog: MatDialog) {}

  /* Click binding... */
  @HostListener('click', ['$event'])
  public onClick() {
    /* Launch the supplied dialog */
    this.matDialog.open(this.dialog, {
      panelClass: this.panelClass,
    });
  }
}
