import { Component, Input, OnInit } from '@angular/core';
import { Document, DocumentType } from '@app/ui';
import { AuthService } from '@app/ui';

@Component({
  selector: 'app-document-card',
  templateUrl: './document-card.component.html',
  styleUrls: ['./document-card.component.scss']
})
export class DocumentCardComponent implements OnInit {

  @Input()
  label: string;

  @Input()
  document: Document | undefined;

  Type = DocumentType;

  constructor(public auth: AuthService) { }

  ngOnInit() {
    if (!(this.document instanceof Document) && this.document !== undefined) {
      throw new TypeError('The input \'document\' must be an instance of Document');
    }
  }

}
