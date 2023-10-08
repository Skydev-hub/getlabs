import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  applyNetworkValidationErrors,
  AuthService,
  compareEntities,
  File,
  FilePurpose,
  FormInputMaskTypes,
  getFormFieldError,
  markFormAsTouched,
  MaskValidatorService,
  StaffUser,
  StaffUserService,
} from '@app/ui';
import { plainToClass } from 'class-transformer';
import { USStates } from '../../../shared/utils/us-states.data';
import { RegexValidator } from '../../../shared/validators/regex.validator';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-team-member-profile-form',
  templateUrl: './team-member-profile-form.component.html',
  styleUrls: ['./team-member-profile-form.component.scss'],
})
export class TeamMemberProfileFormComponent implements OnInit, OnChanges {
  @Input()
  public user: StaffUser;

  @Output()
  public save = new EventEmitter<StaffUser>();

  public form: FormGroup;

  public states = USStates;

  public phoneNumberMask = FormInputMaskTypes.phoneNumber;

  public avatarReq$: Subscription;

  constructor(
    private fb: FormBuilder,
    private service: StaffUserService,
    private auth: AuthService,
    private readonly maskValidatorService: MaskValidatorService
  ) {
    this.form = fb.group({
      firstName: [null, Validators.required],
      lastName: [null, Validators.required],
      phoneNumber: [null, [Validators.required, this.maskValidatorService.getConformsToMaskValidator(this.phoneNumberMask, 'phoneNumber')]],
      email: [null, [Validators.required, Validators.email]],
      accessLevel: [{ value: 'support', disabled: this.isCurrentUser() }, Validators.required],
      avatar: [null],
      address: fb.group({
        street: [null, Validators.required],
        unit: [null],
        city: [null, Validators.required],
        state: [null, Validators.required],
        zipCode: [null, [Validators.required, RegexValidator(/^\d{5}$/, 'zipCode')]],
      }),
    });
  }

  ngOnInit() {
    this.form.get('avatar').valueChanges.subscribe((file: File) => {
      this.user = plainToClass(StaffUser, { ...this.user, avatar: file });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.form.patchValue(this.user || {});

    const alc = this.form.get('accessLevel');

    if (this.isCurrentUser()) {
      alc.disable();
    } else {
      alc.enable();
    }
  }

  getError(fieldName: string): string {
    return getFormFieldError(this.form, fieldName);
  }

  getFilePurpose(): FilePurpose {
    return FilePurpose.Avatar;
  }

  isCurrentUser(): boolean {
    return compareEntities(this.user, this.auth.getUser());
  }

  onAvatarChange(file: File): void {
    if (this.user && this.user.id) {
      this.avatarReq$ = this.service
        .update(this.user.id, {
          avatar: file.id as any,
        })
        .subscribe(
          /* eslint-disable-next-line @typescript-eslint/no-empty-function */
          (user) => {},
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

      this.service
        .save({
          id: this.user ? this.user.id : undefined,
          firstName: model.firstName,
          lastName: model.lastName,
          phoneNumber: model.phoneNumber,
          email: model.email,
          accessLevel: model.accessLevel,
          avatar: model.avatar instanceof File ? model.avatar.id : model.avatar,
          address: {
            street: model.address.street,
            unit: model.address.unit,
            city: model.address.city,
            state: model.address.state,
            zipCode: model.address.zipCode,
          },
        })
        .subscribe(
          (user) => this.save.emit(user),
          (error: HttpErrorResponse) => {
            applyNetworkValidationErrors(this.form, error);
          }
        );
    }
  }
}
