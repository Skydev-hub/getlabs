import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfigurationService } from '../services';
import { InterAppUrlPipe } from '../pipes';
import { LabcorpAcknowledgementDialogComponent } from '../components/dialog/labcorp-acknowledgement-dialog/labcorp-acknowledgement-dialog.component';

@Directive({
  selector: '[appLabcorpAcknowledgement]',
})
export class LabcorpAcknowledgementDirective {
  constructor(private readonly matDialog: MatDialog, private readonly config: ConfigurationService) {}

  @HostListener('click', ['$event.target'])
  onClick() {
    this.matDialog
      .open(LabcorpAcknowledgementDialogComponent, {
        disableClose: true,
        closeOnNavigation: true,
        panelClass: 'acknowledgement-dialog',
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          window.location.href = new InterAppUrlPipe(this.config).transform('/book', 'app');
        }
      });
  }
}
