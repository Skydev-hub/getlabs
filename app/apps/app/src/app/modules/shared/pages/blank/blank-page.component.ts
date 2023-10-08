import { Component, OnInit } from '@angular/core';

@Component({
  templateUrl: './blank-page.component.html',
  styleUrls: ['./blank-page.component.scss']
})
export class BlankPageComponent implements OnInit {

  // NOTE: This is a blank page component that is used as a placeholder for routes that always redirect else where

  constructor() { }

  ngOnInit() {
  }

}
