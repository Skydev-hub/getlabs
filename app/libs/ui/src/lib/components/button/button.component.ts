import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, ElementRef, Input, OnInit, Optional, Renderer2 } from '@angular/core';
import { CanDisable } from '@angular/material/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { LoadingDirective } from '../../directives';

export type ButtonType = 'basic' | 'primary' | 'secondary' | 'border' | 'text' | 'icon';
export type ButtonSize = 'xs' | 'small' | 'medium' | 'large' | 'undefined';

@Component({
  /* eslint-disable-next-line @angular-eslint/component-selector */
  selector: 'button[app-button], a[app-button]',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss'],
  host: {
    '[attr.disabled]': 'disabled || null',
  },
})
export class ButtonComponent implements OnInit, CanDisable {
  private _type: ButtonType;

  /* eslint-disable-next-line @angular-eslint/no-input-rename */
  @Input('app-button')
  set type(val: ButtonType) {
    this.setType(val, this._type);
    this._type = val;
  }

  get type(): ButtonType {
    return this._type;
  }

  private _size: ButtonSize;

  @Input()
  set size(val: ButtonSize) {
    this.setSize(val, this._size);
    this._size = val;
  }

  get size(): ButtonSize {
    return this._size;
  }

  private _responsive: boolean;

  @Input()
  set responsive(val: boolean) {
    val = coerceBooleanProperty(val);
    this.setResponsive(val);
    this._responsive = val;
  }

  get responsive(): boolean {
    return this._responsive;
  }

  private _collapsable: boolean;

  @Input()
  set collapsable(val: boolean) {
    val = coerceBooleanProperty(val);
    this.setCollapsable(val);
    this._collapsable = val;
  }

  get collapsable(): boolean {
    return this._collapsable;
  }

  private _disabled: boolean = false;

  @Input()
  set disabled(value: any) {
    this._disabled = coerceBooleanProperty(value);
  }

  get disabled() {
    return this._disabled;
  }

  constructor(private readonly _elementRef: ElementRef, private readonly renderer: Renderer2, @Optional() private loading: LoadingDirective) {
    // Hook in to [loading] directive and disable button when loading is active
    if (loading) {
      this.loading.loading$.pipe(distinctUntilChanged()).subscribe((status) => (this.disabled = status));
    }
  }

  ngOnInit() {
    this.type = this.type || 'primary';
    this.size = this.size || 'large';
    this.responsive = this.responsive !== undefined ? this.responsive : true;
  }

  setType(current?: ButtonType, previous?: ButtonType) {
    if (current) {
      this.addClass(`btn-type--${current}`);
    }

    if (previous && previous !== current) {
      this.removeClass(`btn-type--${previous}`);
    }
  }

  setSize(current?: ButtonSize, previous?: ButtonSize) {
    if (current) {
      this.addClass(`btn-size--${current}`);
    }

    if (previous && previous !== current) {
      this.removeClass(`btn-size--${previous}`);
    }
  }

  setResponsive(val?: boolean) {
    val ? this.addClass('btn-responsive') : this.removeClass('btn-responsive');
  }

  setCollapsable(val?: boolean) {
    val ? this.addClass('btn-collapsable') : this.removeClass('btn-collapsable');
  }

  // ---

  private addClass(cls: string) {
    this.renderer.addClass(this._elementRef.nativeElement, cls);
  }

  private removeClass(cls: string) {
    this.renderer.removeClass(this._elementRef.nativeElement, cls);
  }
}
