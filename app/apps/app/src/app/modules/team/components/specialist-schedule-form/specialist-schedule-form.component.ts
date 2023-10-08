import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { applyNetworkValidationErrors, markFormAsTouched, SpecialistUser, SpecialistUserService } from '@app/ui';
import { Subscription } from 'rxjs';
import { FormGroupControl } from '../../../shared/types/form-group-control';


@Component({
  selector: 'app-team-specialist-schedule-form',
  templateUrl: './specialist-schedule-form.component.html',
  styleUrls: ['./specialist-schedule-form.component.scss'],
})
export class SpecialistScheduleFormComponent implements OnInit {

  @Input()
  public user: SpecialistUser;

  @Output()
  public save = new EventEmitter<SpecialistUser>();

  public form: FormGroup;

  req$: Subscription;

  constructor(
    private fb: FormBuilder,
    private service: SpecialistUserService,
  ) {
    this.form = fb.group({
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
      blackouts: new FormGroupControl(),
      exposeHours: [],
    });
  }

  ngOnInit() {
    this.form.patchValue(this.user.schedule || {});
  }

  onSubmit() {
    markFormAsTouched(this.form);
    if (this.form.valid) {
      const model = this.form.value;

      this.req$ = this.service.update(this.user.id, {
        schedule: {
          monday: model.monday ? model.monday : undefined,
          tuesday: model.tuesday ? model.tuesday : undefined,
          wednesday: model.wednesday ? model.wednesday : undefined,
          thursday: model.thursday ? model.thursday : undefined,
          friday: model.friday ? model.friday : undefined,
          saturday: model.saturday ? model.saturday : undefined,
          sunday: model.sunday ? model.sunday : undefined,
          blackouts: model.blackouts ? model.blackouts : undefined,
          exposeHours: !!model.exposeHours,
        },
      }).subscribe(
        user => {
          this.save.emit(user);
        },
        (error: HttpErrorResponse) => {
          applyNetworkValidationErrors(this.form, error);
        },
      );
    }
  }
}
