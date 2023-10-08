import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PatientPlaceService } from '@app/ui';
import { ConfigurationService, getFormFieldError, InterAppUrlPipe, markFormAsTouched } from '@app/ui';

@Component({
  selector: 'app-book-with-address',
  templateUrl: './book-with-address.component.html',
  styleUrls: ['./book-with-address.component.scss']
})
export class BookWithAddressComponent implements OnInit {
  form: FormGroup;

  constructor(fb: FormBuilder, private readonly patientPlaceService: PatientPlaceService, private readonly config: ConfigurationService) {
    this.form = fb.group({
      address: [null, Validators.required]
    });
  }

  ngOnInit() {
    this.patientPlaceService.get().subscribe(result => {
      if (!result || !result.place) {
        return;
      }
      this.form.setValue({
        address: result.place
      });
    });
  }

  getError(fieldName: string): string {
    if (!this.form.touched) {
      return null;
    }
    return getFormFieldError(this.form, fieldName);
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      this.patientPlaceService.set(this.form.value.address.place_id);
      window.location.href = new InterAppUrlPipe(this.config).transform('/book', 'app');
    }
  }
}
