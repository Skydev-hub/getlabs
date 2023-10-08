import { Input, Directive } from '@angular/core';
import { AppointmentEntity, File, FilePurpose, LabOrderDetailsEntity } from '@app/ui';

@Directive()
/* eslint-disable-next-line @angular-eslint/directive-class-suffix */
export abstract class AbstractAppointmentStepsComponent {
  /* Maps a given file purpose to its corresponding field in AppointmentEntity */
  static readonly DocumentAttachmentIndex: { [key in FilePurpose]?: keyof LabOrderDetailsEntity } = {
    [FilePurpose.AccuDraw]: 'accuDraw',
    [FilePurpose.AbnDocument]: 'abnDocument',
    [FilePurpose.LabOrder]: 'labOrderFiles',
  };

  @Input()
  appointment: AppointmentEntity;

  public FilePurpose = FilePurpose;

  /**
   * Determines if the file indicated by the supplied file purpose is populated in all appointment lab order details sets.
   */
  isDocumentSet(filePurpose: FilePurpose, all = true) {
    /* Select the evaluator based off of the 'all' parameter - true indicates that all lab order details objects must have the
     * indicated file set; false indicates that only some must have it set. */
    const evaluator = all ? Array.prototype.every : Array.prototype.some;

    return (
      !!this.appointment.labOrderDetails &&
      evaluator.call(this.appointment.labOrderDetails, (lod: LabOrderDetailsEntity) => {
        const prop = lod[AbstractAppointmentStepsComponent.DocumentAttachmentIndex[filePurpose]];

        /* Deleted files are not considered as part of this evaluation. */
        return lod.isDeleted || prop instanceof File || (Array.isArray(prop) && !!prop.length && prop.every((file) => file instanceof File));
      })
    );
  }
}
