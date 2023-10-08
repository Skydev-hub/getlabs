import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-cyclical-navigator',
  templateUrl: './cyclical-navigator.component.html',
  styleUrls: ['./cyclical-navigator.component.scss']
})
export class CyclicalNavigatorComponent implements OnInit {

  @Input()
  previousLabel: string;

  @Input()
  nextLabel: string;

  @Output()
  previous: EventEmitter<null> = new EventEmitter<null>();

  @Output()
  next: EventEmitter<null> = new EventEmitter<null>();

  constructor() { }

  ngOnInit() {
  }

}
