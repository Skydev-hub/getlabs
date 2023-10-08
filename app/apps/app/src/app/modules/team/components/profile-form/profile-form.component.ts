import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { applyNetworkValidationErrors, File, FilePurpose, getFormFieldError, markFormAsTouched, StaffUser, StaffUserService, User } from '@app/ui';
import { plainToClass } from 'class-transformer';
import { RegexValidator } from '../../../shared/validators/regex.validator';

@Component({
  selector: 'app-team-profile-form',
  templateUrl: './profile-form.component.html',
  styleUrls: ['./profile-form.component.scss']
})
export class ProfileFormComponent implements OnInit, OnChanges {
  @Input()
  public user: StaffUser;

  @Output()
  public save = new EventEmitter<StaffUser>();

  public form: FormGroup;

  constructor(private fb: FormBuilder, private service: StaffUserService) {
    this.form = fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      email: [null, Validators.email],
      avatar: [null],
      address: fb.group({
        street: [null],
        unit: [null],
        city: [null],
        state: [null],
        zipCode: [null, [Validators.required, RegexValidator(/^\d{5}$/, 'zipCode')]]
      })
    });
  }

  ngOnInit() {
    if (!(this.user instanceof User)) {
      throw new TypeError("The input 'user' must be an instance of User");
    }

    this.form.get('avatar').valueChanges.subscribe((file: File) => {
      this.user = plainToClass(StaffUser, { ...this.user, avatar: file });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(this.user || {});
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  getFilePurpose(): FilePurpose {
    return FilePurpose.Avatar;
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.service
        .update(this.user.id, {
          firstName: model.firstName,
          lastName: model.lastName,
          email: model.email,
          avatar: model.avatar instanceof File ? model.avatar.id : model.avatar,
          address: {
            street: model.address.street,
            unit: model.address.unit,
            city: model.address.city,
            state: model.address.state,
            zipCode: model.address.zipCode
          }
        })
        .subscribe(
          user => this.save.emit(user),
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }
}
