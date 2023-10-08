import { Component, EventEmitter, forwardRef, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormBuilder, FormGroup, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator, Validators } from '@angular/forms';
import { FilePurpose, File as GlFile } from '@app/ui';
import { DragDropUploadDirective } from '../../directives/drag-drop-upload.directive';
import { UploadState } from '../form/input/file-input/file-input.component';
import { extend } from 'lodash-es';
import { MultipleFileInputComponent } from '../form/input/multiple-file-input/multiple-file-input.component';

/**
 * Generic component for implementing drag-and-drop file upload functionality.  Embeds an instance of FileInput which is
 * responsible for handling the actual upload operations.  The embedded instance is also used as an alternate upload workflow
 * option, in that the user can choose to select a file through the traditional prormpted means.
 */
@Component({
  selector: 'app-drag-drop-file-upload',
  templateUrl: './drag-drop-file-upload.component.html',
  styleUrls: ['./drag-drop-file-upload.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DragDropFileUploadComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DragDropFileUploadComponent),
      multi: true,
    }
  ]
})
export class DragDropFileUploadComponent implements ControlValueAccessor, OnInit, Validator {
  constructor(private formBuilder: FormBuilder) {
    this.form = this.formBuilder.group({
      files: [null, Validators.required]
    });
  }

  @Input()
  public purpose: FilePurpose;

  @Input()
  public types: string[] = ['image/jpeg', 'image/png'];

  @Input()
  public buttonLabel: string;

  @Output()
  public accept = new EventEmitter<Array<GlFile>>();

  @ViewChild(MultipleFileInputComponent, { static: true })
  public filesInput: MultipleFileInputComponent;

  @ViewChild('dragDropUnselected', { static: true, read: DragDropUploadDirective })
  private unselectedDragDrop: DragDropUploadDirective;

  // @ViewChild('uploadedDragDrop', { static: false })
  // private uploadedDragDrop: DragDropUploadDirective;

  public UploadState = UploadState;

  public form: FormGroup;

  private onChange: (value: Array<GlFile>) => void = () => {};

  private onTouched: () => void = () => {};

  ngOnInit(): void {
    /* Register a listener to change this control's recognized value whenever the embedded control changes. */
    this.files.valueChanges.subscribe((files: Array<GlFile>) => {
      this.onChange(files);

      /* If the number of managed files drops to 0, re-enable the enveloping instance of DragDropUploadDirective */
      if (!files.length) {
        this.unselectedDragDrop.activate();
      }
    });
  }

  /**
   * Retrieves the current upload state from the embedded multiple file upload component instance.
   */
  public getUploadState() {
    return this.filesInput.getUploadState();
  }

  /**
   * Event handler for the drag/drop event - writes the supplied files to the embedded multiple file upload
   * component instance.
   */
  public doDragDrop(files: Array<File>, append = false) {
    /* As soon as this method is executed by the main container, we will need the main container's instance of DragDropUploadDirective
     * to be disabled. */
    if (!append) {
      this.unselectedDragDrop.deactivate();
    }

    /* Set the files input component as touched, and write the value. */
    this.files.markAsTouched();

    /* If append is set to true, augment the existing set of files with the supplied set. */
    this.filesInput.writeValue(append ? (this.files.value as Array<File | GlFile>).concat(files) :
      files);
  }

  /**
   * Writes the supplied files to the multiple file input component
   */
  public writeValue(files: Array<GlFile>) {
    this.filesInput.writeValue(files);
  }

  public registerOnChange(fn: (value: Array<GlFile>) => void): void {
    this.onChange = (value) => {
      fn(value);
      this.onTouched();
    };
  }

  public registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  get files() {
    return this.form.get('files');
  }

  /**
   * Determines if this upload control presently has multiple files selected.
   */
  public hasMultipleFiles() {
    const c = this.files;
    return !!(c && c.value && c.value.length > 1);
  }

  public validate(control: AbstractControl): ValidationErrors | null {
    /* Find embedded errors first. */
    const embeddedErrors = this.files.errors;

    /* Merge embedded errors with any stemming out of this form. */
    const errors = extend(this.form.errors || {}, embeddedErrors);

    return Object.keys(errors).length > 0 ? errors : null;
  }
}
