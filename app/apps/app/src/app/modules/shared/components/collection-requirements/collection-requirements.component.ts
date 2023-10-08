import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-collection-requirements',
  templateUrl: './collection-requirements.component.html',
  styleUrls: ['./collection-requirements.component.scss'],
})
export class CollectionRequirementsComponent implements OnInit {

  @Input()
  triple = false;

  constructor() { }

  ngOnInit() {
  }

}
