import { Directive, ElementRef, EventEmitter, HostListener, Inject, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Generic directive that implements drag-and-drop file functionality on a target host element.
 */
@Directive({
  selector: '[appDragDropUpload]'
})
export class DragDropUploadDirective implements OnInit, OnDestroy {
  private dragHoverClass = 'drag-drop-hover';

  private isActive = true;

  private unlisteners: Function[];

  @Output()
  fileSelect = new EventEmitter<Array<File>>();

  private docListener = e => e.preventDefault();

  constructor(private host: ElementRef, private renderer2: Renderer2, @Inject(DOCUMENT) private _document: Document) {}

  // @HostListener('dragover', ['$event'])
  // onDragover(evt) {
  //   /* Only proceed if this directive is active. */
  //   if (!this.isActive) {
  //     return;
  //   }
  //
  //   /* Add the dragover class to the host element */
  //   if (!this.host.nativeElement.classList.contains(this.dragHoverClass)) {
  //     this.renderer2.addClass(this.host.nativeElement, this.dragHoverClass);
  //   }
  //
  //   evt.preventDefault();
  //   evt.stopPropagation();
  // }
  //
  // @HostListener('drop', ['$event'])
  // onDrop(evt) {
  //   /* Only proceed if this directive is active. */
  //   if (!this.isActive) {
  //     return;
  //   }
  //
  //   evt.preventDefault();
  //   evt.stopPropagation();
  //
  //   /* Extract the file from the event payload, and trigger the onFileSelect output binding */
  //   if (evt.dataTransfer.files.length > 0) {
  //     this.fileSelect.emit(Array.from(evt.dataTransfer.files));
  //     this.renderer2.removeClass(this.host.nativeElement, this.dragHoverClass);
  //   }
  // }
  //
  // @HostListener('dragleave', ['$event'])
  // onDragleave(evt) {
  //   /* Only proceed if this directive is active. */
  //   if (!this.isActive) {
  //     return;
  //   }
  //
  //   /* Remove the drag hover class */
  //   this.renderer2.removeClass(this.host.nativeElement, this.dragHoverClass);
  //
  //   evt.preventDefault();
  //   evt.stopPropagation();
  // }

  /* While this directive is active, we must have a listener on Document to prevent accidental drops forcing a load
   * of the file. */
  ngOnInit(): void {
    this._document.addEventListener('dragover', this.docListener, false);
    this._document.addEventListener('drop', this.docListener, false);

    this.activate();
  }

  ngOnDestroy(): void {
    this._document.removeEventListener('dragover', this.docListener);
    this._document.removeEventListener('drop', this.docListener);

    this.deactivate();
  }

  public activate() {
    /* Only activate if there are no listeners presently active. */
    if (!this.unlisteners) {
      this.unlisteners = [
        this.renderer2.listen(this.host.nativeElement, 'dragover', (evt) => {
          /* Add the dragover class to the host element */
          if (!this.host.nativeElement.classList.contains(this.dragHoverClass)) {
            this.renderer2.addClass(this.host.nativeElement, this.dragHoverClass);
          }

          evt.preventDefault();
          evt.stopPropagation();
        }),

        this.renderer2.listen(this.host.nativeElement, 'drop', (evt) => {
          evt.preventDefault();
          evt.stopPropagation();

          /* Extract the file from the event payload, and trigger the onFileSelect output binding */
          if (evt.dataTransfer.files.length > 0) {
            this.fileSelect.emit(Array.from(evt.dataTransfer.files));
            this.renderer2.removeClass(this.host.nativeElement, this.dragHoverClass);
          }
        }),

        this.renderer2.listen(this.host.nativeElement, 'dragleave', (evt) => {
          /* Only proceed if this directive is active. */
          if (!this.isActive) {
            return;
          }

          /* Remove the drag hover class */
          this.renderer2.removeClass(this.host.nativeElement, this.dragHoverClass);

          evt.preventDefault();
          evt.stopPropagation();
        })
      ];
    }
  }

  public deactivate() {
    if (this.unlisteners) {
      this.unlisteners.forEach(unlistener => unlistener());
      this.unlisteners = null;
    }
  }
}
