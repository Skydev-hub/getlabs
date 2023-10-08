import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AppointmentEntity, File, FileService, getFormFieldError, markFormAsTouched } from '@app/ui';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { SignaturePadComponent } from '../signature-pad/signature-pad.component';

export interface DeliveryVerification {
  recipient: string;
  signature: string;
}

@Component({
  selector: 'app-delivery-verification-form',
  templateUrl: './delivery-verification-form.component.html',
  styleUrls: ['./delivery-verification-form.component.scss'],
})
export class DeliveryVerificationFormComponent implements OnChanges {

  @Input()
  appointment: AppointmentEntity;

  @Input()
  disabled: boolean = false;

  @Output()
  deliveryVerified: EventEmitter<DeliveryVerification> = new EventEmitter<DeliveryVerification>();

  @ViewChild(SignaturePadComponent, { static: true })
  signature: SignaturePadComponent;

  form: FormGroup;

  private _signatureDataUrl: string;

  constructor(fb: FormBuilder, private files: FileService) {
    this.form = fb.group({
      recipient: [null, Validators.required],
      signature: [null, Validators.required],
    });

    this.form.get('signature').valueChanges.subscribe((value) => this._signatureDataUrl = value);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.appointment) {
      this.form.patchValue({
        recipient: this.appointment.recipient,
      });

      if (this.appointment.signature instanceof File) {
        this._signatureDataUrl = null;
        this.files.download(this.appointment.signature).pipe(
          switchMap(blob => this.blobToDataUrl(blob)),
        ).subscribe(dataUrl => {
          this.redrawCanvas(dataUrl);
        });
      }
    }

    if (changes.disabled) {
      this.disabled ? this.form.disable() : this.form.enable();
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  submit() {
    markFormAsTouched(this.form);

    if (this.form.valid) {
      const model = this.form.value;
      this.deliveryVerified.emit({
        recipient: model.recipient,
        signature: model.signature,
      });
    }
  }

  redrawCanvas(dataUrl?: string) {
    this.signature.resize();

    const data = dataUrl || this._signatureDataUrl;

    if (data) {
      this._signatureDataUrl = data;
      setTimeout(() => {
        this.form.patchValue({
          signature: data,
        });
      });
    }
  }

  // ---

  private blobToDataUrl(blob: Blob): Observable<string> {
    return new Observable(observer => {
      const reader = new FileReader();
      reader.onload = () => {
        observer.next(reader.result.toString());
        observer.complete();
      };
      reader.readAsDataURL(blob);
    });
  }

}
