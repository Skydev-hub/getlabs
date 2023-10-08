import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './patients-page.component.html',
  styleUrls: ['./patients-page.component.scss']
})
export class PatientsPageComponent implements OnInit {

  search = new FormControl();

  constructor() { }

  ngOnInit() {}

}
