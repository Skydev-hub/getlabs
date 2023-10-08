import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
  ValidatorFn,
} from '@angular/forms';
import { File as GlFile, FilePurpose, getFieldError } from '@app/ui';
import { isEqual } from 'lodash-es';
import { filter, pairwise } from 'rxjs/operators';
import { UploadPlaceholder, UploadState } from '../file-input/file-input.component';

export const hasAtLeastOneFileValidator: ValidatorFn = (control: AbstractControl) => {
  return control.value instanceof GlFile || (Array.isArray(control.value) && control.value.some((val) => val instanceof GlFile)) ? null : { hasFile: true };
};

/**
 * MultipleFileInputComponent is a form widget that allows for the selection/management/preview of multiple files within a
 * single field.  This component works by instantiating a FileInputComponent instance for each file described by this
 * component; upload operations are delegated to the embedded FileInputComponent instances.
 */
@Component({
  templateUrl: './multiple-file-input.component.html',
  styleUrls: ['./multiple-file-input.component.scss'],
  selector: 'app-multiple-file-input',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => MultipleFileInputComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => MultipleFileInputComponent),
      multi: true,
    },
  ],
})
export class MultipleFileInputComponent implements ControlValueAccessor, OnInit, Validator {
  @Input()
  public label: string;

  @Input()
  public purpose: FilePurpose;

  @Input()
  public showAddFile: boolean = true;

  @Input()
  public autoAccept: boolean = false;

  @Input()
  public types: string[] = ['image/jpeg', 'image/png'];

  @Input()
  public btnClass: string = 'ui-primary-button ui-primary-button--large';

  @Input()
  public btnSize: 'large' | 'medium' | null;

  @Input()
  public disabled: boolean = false;

  @Input()
  public useCustomMultiAnchor: boolean = false;

  @Output()
  public accept = new EventEmitter<Array<GlFile>>();

  @Output()
  public removed = new EventEmitter<GlFile>();

  public uploadStates = UploadState;

  public form: FormGroup;

  @ViewChild('multiInput')
  private multiInput: ElementRef;

  private onChange: (value: Array<GlFile | File>) => void = () => {};

  private onTouched: () => void = () => {};

  constructor(private formBuilder: FormBuilder) {
    this.form = formBuilder.group({
      files: formBuilder.array([]),
    });
  }

  public get files(): FormArray {
    return this.form.get('files') as FormArray;
  }

  ngOnInit(): void {
    /* Subscribe to changes in the embedded files control, which contains the values reported by embedded
     * instances of FileInputComponent. */
    this.files.valueChanges
      .pipe(
        pairwise(),
        filter((vals) => !isEqual(vals[1], vals[0]))
      )
      .subscribe((vals: Array<Array<File | GlFile>>) => {
        const newVals = vals[1];
        const oldVals = vals[0];

        /* If the new value has all GlFile instances, autoAccept is set, and this action does not represent a
         * file removal, accept automatically. */
        if (
          (!oldVals || newVals.length >= oldVals.length) &&
          this.autoAccept &&
          !newVals.some((newVal) => {
            return !(newVal instanceof GlFile) || newVal instanceof UploadPlaceholder;
          })
        ) {
          this.accept.emit(newVals as Array<GlFile>);
        }

        /* Cascade changes through the onChange callback. */
        this.onChange(newVals);
      });
  }

  /**
   * Adds a file upload slot, which will be visible depending on the operation mode of this component.
   */
  public addFileControl(value?: GlFile) {
    // const control = new FormControl(value, Validators.required);
    this.files.push(new FormControl(value));
    setTimeout(() => this.onChange(this.files.value));

    /* Add a listener for the control that fires whenever the value changes. */
    // control.valueChanges.subscribe(() => {
    //   /* Cascade updates through onChange */
    //   this.onChange(this.files.value);
    // });
  }

  /**
   * Writes the supplied array of GlFile / File instances to the embedded FileInputComponent instances.  If there is a mismatch
   * between the number of FileInputComponent instances and the number of supplied File/GlFile instances, this method will
   * automatically adjust the set of available instances accordingly.
   */
  public writeValue(files: Array<GlFile | File>): void {
    files = files || [];

    /* If the length of the inbound value is less than the length of the last recorded value, we will
     * need to trim some elements. */
    for (let i = this.files.controls.length - 1; i > files.length - 1; i--) {
      this.removeControl(this.files.controls[i]);
    }

    /* Iterate through the various file elements, and set accordingly. */
    Array.prototype.forEach.call(files, (file, idx) => {
      /* If no control exists for this file, create one now. */
      if (this.files.controls.length < idx + 1) {
        this.addFileControl();
      }

      /* place it on the control with the matching index... */
      /* Infuriatingly necessary to allow the onChange method in the embedded instances of FileInputComponent to initialize */
      setTimeout(() => {
        this.files.controls[idx].setValue(file);
        this.files.controls[idx].markAsTouched();
      });
    });
  }

  public registerOnChange(fn: (value: Array<GlFile | File>) => void): void {
    this.onChange = (value) => {
      fn(value);
      this.onTouched();
    };
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  /**
   * Event handler for selecting files.
   */
  public doFileSelect(event: Event, isAppend = false) {
    event.stopPropagation();
    let target: File[] = Array.from((event.target as any).files);

    /* If we're operating in append mode, we will need to add the supplied files to the existing set of uploaded files. */
    if (isAppend) {
      /* Take this opportunity to remove any dead slots (i.e. file slots with errors, etc.) */
      target = this.files.value.filter(Boolean).concat(target);
    }

    this.writeValue(target);

    /* Clear the file input control to prevent conflicts when re-selecting the same file. */
    this.multiInput.nativeElement.value = '';
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    /* The only scenario we can reasonably assume to be invalid is if an upload is in progress. */
    return this.getUploadState() === UploadState.Uploading ? { uploadInProgress: { valid: false, message: 'An upload is currently in progress' } } : null;
  }

  /**
   * Opens up the file selection dialog.
   */
  public openFileDialog(event?: Event) {
    /* If an event object is supplied, ensure that the default action is prevented so we don't submit the parent form
     * (if applicable). */
    if (event) {
      event.preventDefault();
    }

    /* Only available when no other fields are present */
    if (this.multiInput) {
      this.multiInput.nativeElement.click();
    }
  }

  /**
   * Retrieves the current uploading state of this control according to the states of the controls described by
   * this component instance. The 'Uploading' state has precedence, followed by 'Unselected'.
   */
  public getUploadState(): UploadState {
    /* Short circuit - if there are no controls, return unselected */
    if (!this.files.controls.length) {
      return UploadState.Unselected;
    }

    let status = null;

    this.files.controls.find((control) => {
      /* Scan each value and determine the state of the control as a whole. */

      /* Have a preference for uploading... if any control is uploading, the whole widget is uploading... */
      if (control.value instanceof UploadPlaceholder) {
        status = UploadState.Uploading;
        return true;
      }

      /* If none of the controls are uploading, the next priority is unselected - but only if
       * the controls do not have errors. */
      status = !control.value && control.valid ? UploadState.Unselected : status;
    });

    /* If the above logic did not return any status, then the resulting value is uploaded. */
    return status === null ? UploadState.Uploaded : status;
  }

  getError(input: AbstractControl): string {
    return getFieldError(input);
  }

  /**
   * Clears the value from each of the controls described by this component, and then clears the controls
   * from the form itself (i.e. reverts back to 0 controls).
   */
  public reset() {
    /* Clean up the files that the user previously uploaded. */
    this.files.controls.forEach((control) => control.setValue(null));

    /* Clear all controls */
    this.files.clear();

    this.onChange(this.files.value);
  }

  // public onUpload() {
  //   /* If all controls have finished uploading, add a new upload control. */
  //   // if (this.getUploadState() === UploadState.Uploaded) {
  //   //   this.addFileControl();
  //   // }
  // }

  /**
   * Removes the supplied control from the set of embedded FileInputComponent controls.
   */
  public removeControl(control: AbstractControl) {
    const removedFile = control.value;

    /* Clear out the value of this control. */
    control.setValue(null);

    /* Remove this control */
    this.files.removeAt(this.files.controls.indexOf(control));

    this.onChange(this.files.value);
    this.removed.emit(removedFile);
  }
}
