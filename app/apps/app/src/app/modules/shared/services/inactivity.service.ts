import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Idle } from '@app/idle';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { InactivityDialogComponent } from '../components/dialog/inactivity-dialog/inactivity-dialog.component';
import { AuthService } from '@app/ui';

@Injectable({
  providedIn: 'root'
})
export class InactivityService {

  private unsubscribe$ = new Subject<void>();

  constructor(private idle: Idle, private auth: AuthService, private dialog: MatDialog) { }

  start(): void {
    this.idle.onIdleStart.pipe(
      takeUntil(this.unsubscribe$),
      filter(() => this.auth.isTokenValid())
    ).subscribe(() => {
      this.dialog.open(InactivityDialogComponent, {
        restoreFocus: true,
        disableClose: true,
      });
    });

    this.idle.watch();
  }

  stop(): void {
    this.idle.stop();
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
