import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-small-hero',
  templateUrl: './small-hero.component.html',
  styleUrls: ['./small-hero.component.scss'],
  inputs: ['heroClass']
})
export class SmallHeroComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  @Input() heroClass: string;

}
