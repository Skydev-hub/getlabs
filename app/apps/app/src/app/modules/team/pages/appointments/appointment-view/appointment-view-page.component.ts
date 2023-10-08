import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { AppointmentEntity, AppointmentStatus, File, FileService, LabOrderSeedTypes } from '@app/ui';
import { ToastrService } from 'ngx-toastr';
import { Observable, of } from 'rxjs';
import { PaymentDto } from '../../../../../models/payment.dto';
import { AppointmentService } from '../../../../shared/services/appointment.service';
import { LightboxService } from '../../../../shared/services/lightbox.service';
import { AppointmentCancelConfirmationDialogData } from '../../../components/dialog/appointment-cancel-dialog-confirmation/appointment-cancel-confirmation-dialog-data.interface';
import { AppointmentCancelConfirmationDialogComponent } from '../../../components/dialog/appointment-cancel-dialog-confirmation/appointment-cancel-confirmation-dialog.component';
import { AppointmentCancelDialogData } from '../../../components/dialog/appointment-cancel-dialog/appointment-cancel-dialog-data.interface';
import { AppointmentCancelDialogComponent } from '../../../components/dialog/appointment-cancel-dialog/appointment-cancel-dialog.component';
import { AppointmentRefundConfirmationDialogData } from '../../../components/dialog/appointment-refund-dialog-confirmation/appointment-refund-confirmation-dialog-data.interface';
import { AppointmentRefundConfirmationDialogComponent } from '../../../components/dialog/appointment-refund-dialog-confirmation/appointment-refund-confirmation-dialog.component';
import { AppointmentRefundDialogData } from '../../../components/dialog/appointment-refund-dialog/appointment-refund-dialog-data.interface';
import { AppointmentRefundDialogComponent } from '../../../components/dialog/appointment-refund-dialog/appointment-refund-dialog.component';
import { AssignSpecialistDialogComponent, AssignSpecialistDialogData } from '../../../components/dialog/assign-specialist-dialog/assign-specialist-dialog.component';


@Component({
  templateUrl: './appointment-view-page.component.html',
  styleUrls: ['./appointment-view-page.component.scss'],
})
export class AppointmentViewPageComponent implements OnInit {

  appointment: AppointmentEntity;

  payment$: Observable<PaymentDto>;

  // Bind enums to component for use in the template
  Status = AppointmentStatus;

  editing = false;

  LabOrderSeedTypes = LabOrderSeedTypes;

  constructor(
    private route: ActivatedRoute,
    private appointments: AppointmentService,
    private files: FileService,
    private dialog: MatDialog,
    private lightbox: LightboxService,
    private toastr: ToastrService,
  ) {
  }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.appointment = data.appointment;
    });

    if (!(this.appointment instanceof AppointmentEntity)) {
      throw new TypeError('The property \'appointment\' must be an instance of AppointmentEntity');
    }

    this.payment$ = this.appointments.readPayment(this.appointment.id);
  }

  expandInformationPanels(): boolean {
    return !this.appointment.isCompleted() && !this.appointment.isCancelled();
  }

  showSetupSteps(): boolean {
    return this.appointment.status === AppointmentStatus.Pending || this.editing;
  }

  preview(file: File) {
    this.lightbox.open(file);
  }

  assign() {
    const dialog = this.dialog.open(AssignSpecialistDialogComponent, {
      data: {
        appointment: this.appointment,
      } as AssignSpecialistDialogData,
    });

    dialog.afterClosed().subscribe((appointment?: AppointmentEntity) => {
      if (appointment instanceof AppointmentEntity) {
        this.appointment = appointment;
      }
    });
  }

  refund(): void {
    const dialog = this.dialog.open(AppointmentRefundDialogComponent, {
      data: {
        appointment: this.appointment,
      } as AppointmentRefundDialogData,
    });

    dialog.afterClosed().subscribe((payment?: PaymentDto) => {
      if (payment instanceof PaymentDto) {
        this.dialog.open(AppointmentRefundConfirmationDialogComponent, {
          data: {
            payment,
          } as AppointmentRefundConfirmationDialogData,
        });
        this.payment$ = of(payment);
      }
    });
  }

  cancel(): void {
    const dialog = this.dialog.open(AppointmentCancelDialogComponent, {
      data: {
        appointment: this.appointment,
      } as AppointmentCancelDialogData,
    });

    dialog.afterClosed().subscribe((appointment?: AppointmentEntity) => {
      if (appointment instanceof AppointmentEntity) {
        this.dialog.open(AppointmentCancelConfirmationDialogComponent, {
          data: {
            appointment,
          } as AppointmentCancelConfirmationDialogData,
        });
        this.appointment = appointment;
        this.payment$ = this.appointments.readPayment(this.appointment.id);
      }
    });
  }

  onUpdatedAppointment(appointment: AppointmentEntity) {
    this.appointment = appointment;
  }

  onSetupFinished(appointment: AppointmentEntity) {

    this.onUpdatedAppointment(appointment);

    // No incomplete steps left, so exit editing mode and scroll to top
    this.editing = false;

    this.toastr.success('Appointment is ready to go!');
    this.scrollToTop();
  }

  // ---

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

}
