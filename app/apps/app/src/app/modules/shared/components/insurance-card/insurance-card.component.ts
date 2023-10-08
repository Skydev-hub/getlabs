import { Component, EventEmitter, forwardRef, Input, OnInit, Output } from '@angular/core';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { File, FilePurpose, FileService, getFieldError } from '@app/ui';
import { Observable, of } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LightboxService } from '../../services/lightbox.service';
import { UploadPlaceholder } from '../form/input/file-input/file-input.component';

@Component({
  selector: 'app-insurance-card',
  templateUrl: './insurance-card.component.html',
  styleUrls: ['./insurance-card.component.scss'],
  host: {
    '[class.is-complete]': '!!file',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InsuranceCardComponent),
      multi: true,
    },
  ],
})
export class InsuranceCardComponent implements OnInit, ControlValueAccessor {

  @Input()
  label: string;

  @Input()
  file: File;

  @Output()
  fileChange: EventEmitter<File> = new EventEmitter<File>();

  @Input()
  purpose: FilePurpose;

  input: FormControl;

  public loading$: Observable<File>;

  private onChange: (value: File) => void = () => {};

  private onTouched: () => void = () => {};

  constructor(private readonly service: FileService, private readonly lightbox: LightboxService) {
    this.input = new FormControl();

    this.input.valueChanges.subscribe((file: File) => {
      if (file instanceof File) {
        this.fileChange.emit(file);
        this.onChange(file);
        this.writeValue(file);
      }
    });
  }

  ngOnInit(): void {
    if (!this.purpose) {
      throw new TypeError('The input \'purpose\' is required');
    }
  }

  loadFile(file: File) {
    if (!file.thumbnail) {
      this.loading$ = this.service.read(file.id).pipe(
        tap(f => this.file = f),
      );
    } else {
      this.loading$ = of(file);
    }
  }

  getError(): string {
    return getFieldError(this.input);
  }

  preview(file: File) {
    this.lightbox.open(file);
  }

  registerOnChange(fn: () => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  writeValue(file: File): void {
    this.file = file;

    if (file && !(file instanceof UploadPlaceholder)) {
      this.loadFile(file);
    }
  }

}
