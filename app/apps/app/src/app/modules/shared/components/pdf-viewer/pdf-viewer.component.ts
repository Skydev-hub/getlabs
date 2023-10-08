import { Component, Input } from '@angular/core';
import { PDFDocumentProxy } from 'pdfjs-dist';

@Component({
  selector: 'app-pdf-viewer',
  templateUrl: './pdf-viewer.component.html',
  styleUrls: ['./pdf-viewer.component.scss']
})
export class PdfViewerComponent {

  @Input()
  url: string;

  page = 1;

  private pdf: PDFDocumentProxy;

  hasPrev(): boolean {
    return this.page > 1;
  }

  prev() {
    if (this.hasPrev()) {
      this.page--;
    }
  }

  hasNext(): boolean {
    return this.pdf && this.page < this.pdf.numPages;
  }

  next() {
    if (this.hasNext()) {
      this.page++;
    }
  }

  onLoadComplete(pdf: PDFDocumentProxy) {
    this.pdf = pdf;
  }

  onError(err: any) {
    console.error(err);
  }
}
