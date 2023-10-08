import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Platform } from '@angular/cdk/platform';
import { HttpErrorResponse, HttpEventType } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, forwardRef, Input, OnInit, Output, QueryList, ViewChildren } from '@angular/core';
import { AbstractControl, ControlValueAccessor, NG_VALIDATORS, NG_VALUE_ACCESSOR, ValidationErrors, Validator } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { CreateStreamProgressEvent, CreateStreamResultEvent, File as GlFile, FilePurpose, FileService } from '@app/ui';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { LightboxService } from '../../../../services/lightbox.service';

export enum UploadState {
  Unselected = 'UNSELECTED',
  Uploading = 'UPLOADING',
  Uploaded = 'UPLOADED'
}

/**
 * Upload placeholder object that is used to describe a file selection that has not yet been uploaded /
 * is in the process of being uploaded.
 */
export class UploadPlaceholder extends GlFile {
  constructor(public progress: number) {
    super();
  }
}

export const FileTypeSchemes = {
  IMAGES: ['image/jpeg', 'image/png'],
  IMAGES_AND_PDF: ['image/jpeg', 'image/png', 'application/pdf'],
  PDF: ['application/pdf']
};

@Component({
  selector: 'app-file-input',
  templateUrl: './file-input.component.html',
  styleUrls: ['./file-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => FileInputComponent),
      multi: true
    }
  ]
})
export class FileInputComponent implements OnInit, ControlValueAccessor, Validator {
  @Input()
  public label: string;

  @Input()
  public purpose: FilePurpose;

  @Input()
  public btnClass: string = 'ui-primary-button';

  @Input()
  public btnSize: 'large' | 'medium' | null = 'medium';

  @Input()
  public types: string[] = FileTypeSchemes.IMAGES;

  @Input()
  public usePreview = true;

  @Input()
  public size: number = 26214400; // 25mb, same as API

  @Input()
  public reenable: boolean = true;

  @Input()
  public allowReplace: boolean = false;

  @Output()
  public reset = new EventEmitter<undefined>();

  @Output()
  public uploaded = new EventEmitter<GlFile>();

  @Output()
  public close = new EventEmitter<GlFile>();

  @ViewChildren('input')
  inputs: QueryList<ElementRef>;

  public UploadState = UploadState;

  // public isImageFile = isImageFile;

  public disabled = false;

  public fileProcess$: Observable<GlFile>;

  private _file: any;

  private _errors: ValidationErrors = {};

  private _value: GlFile;

  private onChange: (value: GlFile) => void = () => {};

  private onTouched: () => void = () => {};

  get value(): GlFile {
    return this._value;
  }

  set value(value: GlFile) {
    this._errors = {};
    this._value = value;
    this.onChange(value);
    this.onTouched();
  }

  /**
   * Only available while a file is being uploaded.
   */
  set uploadProgress(v: number) {
    if (this.value instanceof UploadPlaceholder) {
      this.value.progress = v;
    }
  }

  /**
   * Only available when a file is being uploaded.
   */
  get uploadProgress() {
    return this.value instanceof UploadPlaceholder ? this.value.progress : null;
  }

  constructor(
    private readonly fileService: FileService,
    private readonly domSanitizer: DomSanitizer,
    private readonly lightboxService: LightboxService,
    private readonly platformService: Platform
  ) {}

  ngOnInit(): void {
    if (!this.purpose) {
      throw new TypeError("The input 'purpose' is required");
    }
  }

  registerOnChange(fn: () => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
  }

  /**
   * Writes the inbound file object as the current file selected by this control.  If the file
   * is an instance of base JS File, this method will commence an upload.  If this file is an
   * instance of GlFile, this method will assign the supplied value directly, and will not perform
   * an upload.
   */
  writeValue(value: GlFile | File): void {
    /* If the inbound file is NOT an instance of Gl File (i.e. it is an instance of base JS file), we need to
     * upload it before writing the value... */
    if (value instanceof File) {
      this.doUpload([value]);
    } else if (value instanceof GlFile) {
      /* Instance of GlFile, we can set it directly. */
      this.value = value;
    } else {
      /* Otherwise, assume it's nothing; in that case, we need to reset the control. */
      this.onReset();
    }
  }

  validate(control: AbstractControl): ValidationErrors | null {
    return this._errors;
  }

  onFileChange(event: Event) {
    event.stopPropagation();
    this.doUpload((event.target as any).files);
  }

  doUpload(files: any[]) {
    const [file] = files;

    if (!file) {
      return;
    }

    this._file = null;
    const errors = {};

    // Verify size
    errors['fileSize'] = Boolean(!isNaN(this.size) && file.size > this.size);

    // Verify mime type
    errors['fileType'] = Boolean(this.types.length && !this.types.includes(file.type));

    /* Due to the way the forms component reads errors, the error object must be empty if
     * no errors are present. */
    this._errors = Object.keys(errors).reduce((accumulator: object, errorKey) => {
      if (errors[errorKey]) {
        accumulator = accumulator || {};
        accumulator[errorKey] = true;
      }

      return accumulator;
    }, null);

    if (this._errors) {
      this.onChange(null);
      return;
    }

    this._file = file;

    this.upload();
  }

  getUploadState(): UploadState {
    return this.value && !(this.value instanceof UploadPlaceholder)
      ? UploadState.Uploaded
      : coerceBooleanProperty(this.uploadProgress)
      ? UploadState.Uploading
      : UploadState.Unselected;
  }

  upload() {
    if (!this._file) {
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;

      this.disabled = true;

      const observables = this.fileService.createWithProgress({
        name: this._file.name,
        type: this._file.type,
        purpose: this.purpose,
        data: btoa(result)
      });
      /* Create a placeholder object for the file upload... */
      this.value = new UploadPlaceholder(0);

      /* Set upload progress to 0 */
      this.uploadProgress = 0;

      observables
        .pipe(
          finalize(() => {
            if (this.reenable) {
              this.disabled = false;
            }

            // Reset the input value element once we are done
            if (this.inputs) {
              this.inputs.forEach(input => (input.nativeElement.value = ''));
            }
          })
        )
        .subscribe(
          (createEvent: CreateStreamProgressEvent<GlFile> | CreateStreamResultEvent<GlFile>) => {
            /* Upload progress case - when the event is indicative of upload progress, update the progress
             * meter. */
            if (createEvent.event.type === HttpEventType.UploadProgress) {
              this.uploadProgress = (createEvent as CreateStreamProgressEvent<GlFile>).progress;
              return;
            }

            /* Otherwise, this event is indicative of a result event - process the result. */
            const resultEvent = createEvent as CreateStreamResultEvent<GlFile>;
            this.value = resultEvent.payload;
            this.uploaded.emit(this.value);
          },
          (err: HttpErrorResponse) => {
            /* Determining the error key is fickle business. */
            this._errors =
              err.error.message &&
              err.error.message.reduce((acc, msg) => {
                acc[msg.property === 'data' ? 'fileSize' : msg.property] = true;
                return acc;
              }, {});

            this.onChange(this.value);
          }
        );
    };

    reader.readAsBinaryString(this._file);
  }

  public onReset() {
    /* Clear the local model... */
    this.value = null;
    this.uploadProgress = null;

    this.reset.emit();
  }

  public onClose() {
    this.close.emit(this.value);
    this.onReset();
  }

  public openLightbox(file: GlFile) {
    this.lightboxService.open(file);
  }

  public sanitizeResourceUrl(resourceUrl: string) {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(resourceUrl);
  }

  public getContentType(file: GlFile) {
    /* There's currently a bug in MacOS Big Sur that causes Safari to freeze whenever we attempt to display a pdf file in an
     * object element with type set to 'application/pdf'... therefore, we omit the type attr value in this scenario. */
    return this.platformService.SAFARI && file.isPDF() ? '' : file.type;
  }

  /**
   * Rotates the uploaded image by the specified number of degrees.
   */
  public rotate(deg: number) {
    /* May only be called when there's an active value. */
    if (this.value) {
      this.fileProcess$ = this.fileService.rotate(this.value, deg);
      this.fileProcess$.subscribe(result => {
        this.writeValue(result);
        this.fileProcess$ = null;
      });
    }
  }
}
