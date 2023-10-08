import { Component, Input, OnInit } from '@angular/core';
import { format } from 'date-fns';
import { DocumentType, User } from '@app/ui';

enum CaseType {
  Affirmative = 'Affirmative',
  Negative = 'Negative'
}

@Component({
  selector: 'app-documents-status',
  templateUrl: './documents-status.component.html',
  styleUrls: ['./documents-status.component.scss']
})
export class DocumentsStatusComponent implements OnInit {
  @Input()
  public user: User;

  @Input()
  public docType: DocumentType;

  public CaseType = CaseType;

  public labels = {
    [DocumentType.EEA]: (type: CaseType) => {
      return type === CaseType.Affirmative ?
        'Signed on ' + format(this.user.getDocument(DocumentType.EEA).completedAt, 'M\'/\'dd\'/\'yy') :
          'Incomplete';
    }
  };

  public ngOnInit(): void {
    if (!(this.user instanceof User)) {
      throw new TypeError('The input \'user\' must be an instance of User');
    }
  }

  public getLabel(type: CaseType) {
    return this.labels[this.docType] && this.labels[this.docType](type);
  }
}
