import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  applyNetworkValidationErrors,
  File,
  FilePurpose,
  FormInputMaskTypes,
  getFormFieldError,
  markFormAsTouched,
  MaskValidatorService,
  SpecialistUser,
  SpecialistUserService
} from '@app/ui';
import { plainToClass } from 'class-transformer';
import { Subscription } from 'rxjs';
import { USStates } from '../../../shared/utils/us-states.data';
import { RegexValidator } from '../../../shared/validators/regex.validator';

@Component({
  selector: 'app-team-specialist-profile-form',
  templateUrl: './specialist-profile-form.component.html',
  styleUrls: ['./specialist-profile-form.component.scss']
})
export class SpecialistProfileFormComponent implements OnInit, OnChanges {
  @Input()
  public user: SpecialistUser;

  @Output()
  public save = new EventEmitter<SpecialistUser>();

  public form: FormGroup;

  public states = USStates;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  public req$: Subscription;

  public avatarReq$: Subscription;

  constructor(
    private fb: FormBuilder,
    private service: SpecialistUserService,
    private readonly maskValidatorService: MaskValidatorService,
  ) {
    this.form = fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null, [
        Validators.required,
        this.maskValidatorService.getConformsToMaskValidator(this.phoneNumberMask, 'phoneNumber'),
      ]],
      email: [null, Validators.email],
      avatar: [null],
      address: fb.group({
        street: [null],
        city: [null],
        state: [null],
        unit: [null],
        zipCode: [null, [Validators.required, RegexValidator(/^\d{5}$/, 'zipCode')]]
      })
    });
  }

  ngOnInit(): void {
    this.form.get('avatar').valueChanges.subscribe((file: File) => {
      this.user = plainToClass(SpecialistUser, { ...this.user, avatar: file });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(this.user || {});
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  getFilePurpose() {
    return FilePurpose.Avatar;
  }

  onAvatarChange(file: File): void {
    if (this.user && this.user.id) {
      this.avatarReq$ = this.service
        .update(this.user.id, {
          avatar: file.id as any
        })
        .subscribe(
          user => {},
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service
        .save({
          id: this.user ? this.user.id : undefined,
          firstName: model.firstName,
          lastName: model.lastName,
          phoneNumber: model.phoneNumber,
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
