import { AfterViewInit, Component, ElementRef, EventEmitter, forwardRef, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { fromEvent, Subject } from 'rxjs';
import { takeUntil, throttleTime } from 'rxjs/operators';
import SignaturePad from 'signature_pad';
import { createCanvasFromImageData, createImageDataFromDataUri, drawImageCenteredOnCanvas, resizeCanvas } from '../../utils/canvas.utils';

@Component({
  selector: 'app-signature-pad',
  templateUrl: './signature-pad.component.html',
  styleUrls: ['./signature-pad.component.scss'],
  host: {
    '[class.disabled]': 'disabled',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SignaturePadComponent),
      multi: true,
    }
  ]
})
export class SignaturePadComponent implements OnInit, AfterViewInit, OnDestroy, ControlValueAccessor {

  @Output()
  begin: EventEmitter<boolean> = new EventEmitter<boolean>();

  @Output()
  end: EventEmitter<boolean> = new EventEmitter<boolean>();

  @ViewChild('canvas', { static: true })
  canvas: ElementRef;

  private signaturePad: SignaturePad;

  private unsubscribe$ = new Subject<void>();

  private _disabled = false;

  get disabled(): boolean {
    return this._disabled;
  }

  set disabled(value: boolean) {
    this._disabled = value;
    this._disabled ? this.signaturePad.off() : this.signaturePad.on();
  }

  private _value: string;

  get value(): string {
    return this._value;
  }

  set value(value: string) {
    if (this.value !== value) {
      this._value = value;
      this.onChange(value);
      this.onTouched();
    }
  }

  private originalCanvas: HTMLCanvasElement;

  private onChange: (value: string) => void = () => {};

  private onTouched: () => void = () => {};

  constructor() { }

  ngOnInit() {
    this.signaturePad = new SignaturePad(this.canvas.nativeElement, {
      onBegin: this.onBegin.bind(this),
      onEnd: this.onEnd.bind(this),
    });
  }

  ngAfterViewInit() {
    this.resize();

    fromEvent(window, 'resize').pipe(
      throttleTime(100),
      takeUntil(this.unsubscribe$
      )).subscribe(() => {
      this.resize();
    });
  }

  resize() {
    setTimeout(() => {
      const canvas = this.canvas.nativeElement;
      resizeCanvas(canvas, canvas.offsetWidth, canvas.offsetHeight, true, this.originalCanvas);
    }, 0);
  }

  clear() {
    this.signaturePad.clear();
    this.writeValue(this.getDataUrl());
  }

  isEmpty(): boolean {
    return this.signaturePad.isEmpty();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
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

  writeValue(value: string): void {
    this.value = value;

    if (this.value) {
      createImageDataFromDataUri(this.value).then((data) => {
        this.originalCanvas = createCanvasFromImageData(data);
        drawImageCenteredOnCanvas(this.canvas.nativeElement, this.originalCanvas);
      });
    } else {
      this.originalCanvas = null;
      this.signaturePad.clear();
    }
  }

  private onBegin(): void {
    this.begin.emit(true);
  }

  onEnd(): void {

    // TODO: Implement a standardized canvas size with signature centered to prevent issues where
    //  the given signature data is in different image size formats depending on the screen size.

    this.value = this.getDataUrl();
    this.originalCanvas = null;
    this.end.emit(true);
  }

  // ---

  private getDataUrl(): string | null {
    return this.isEmpty() ? null : this.signaturePad.toDataURL();
  }
}
