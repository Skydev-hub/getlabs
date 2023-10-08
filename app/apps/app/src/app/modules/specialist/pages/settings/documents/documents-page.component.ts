import {Component, OnInit} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {DocumentType, SpecialistUser} from '@app/ui';

@Component({
  templateUrl: './documents-page.component.html',
  styleUrls: ['./documents-page.component.scss']
})
export class DocumentsPageComponent implements OnInit {

  user: SpecialistUser;

  Type = DocumentType;

  constructor(
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
  }


}
