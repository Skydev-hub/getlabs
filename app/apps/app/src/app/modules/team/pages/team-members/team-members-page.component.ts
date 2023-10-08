import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  templateUrl: './team-members-page.component.html',
  styleUrls: ['./team-members-page.component.scss']
})
export class TeamMembersPageComponent implements OnInit {

  search = new FormControl();

  constructor() { }

  ngOnInit() {
  }

}
