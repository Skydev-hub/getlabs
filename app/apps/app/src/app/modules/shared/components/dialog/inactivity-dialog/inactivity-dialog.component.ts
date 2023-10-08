import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Idle } from '@app/idle';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AuthService } from '@app/ui';

@Component({
  selector: 'app-inactivity-dialog',
  templateUrl: './inactivity-dialog.component.html',
  styleUrls: ['./inactivity-dialog.component.scss']
})
export class InactivityDialogComponent implements OnInit, OnDestroy {

  countdown: number;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private idle: Idle,
    private zone: NgZone,
    private dialogRef: MatDialogRef<InactivityDialogComponent>,
    private auth: AuthService,
  ) {}

  ngOnInit() {

    this.countdown = this.idle.getTimeout();

    this.idle.onTimeoutWarning.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(countdown => this.countdown = countdown);

    this.idle.onTimeout.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      this.countdown = 0;
      this.auth.signOut(this.auth.getPortalUrl());
      this.dialogRef.close();
    });

    this.idle.onIdleEnd.pipe(
      takeUntil(this.unsubscribe$)
    ).subscribe(() => {
      // Run this in the angular zone since there is a bug in @ng-idle
      // and this observable does not run in the zone
      this.zone.run(() => this.dialogRef.close());
    });

  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
