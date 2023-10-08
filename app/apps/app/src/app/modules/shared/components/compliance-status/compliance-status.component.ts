import { Component, Input, OnInit } from '@angular/core';
import { DocumentType, User } from '@app/ui';

@Component({
  selector: 'app-compliance-status',
  templateUrl: './compliance-status.component.html',
  styleUrls: ['./compliance-status.component.scss']
})
export class ComplianceStatusComponent implements OnInit {

  @Input()
  user: User;

  public DocumentType = DocumentType;

  constructor() { }

  ngOnInit() {
    if (!(this.user instanceof User)) {
      throw new TypeError('The input \'user\' must be an instance of User');
    }
  }
}
