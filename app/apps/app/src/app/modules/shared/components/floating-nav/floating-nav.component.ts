import { Component, Directive, OnInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FloatingNavService } from '../../services/floating-nav.service';

@Directive({
  selector: '[appFloatingNavItem]',
  host: {
    '[class.item]': 'true',
  }
})
export class FloatingNavItemDirective {}

@Component({
  selector: 'app-floating-nav',
  templateUrl: './floating-nav.component.html',
  styleUrls: ['./floating-nav.component.scss']
})
export class FloatingNavComponent implements OnInit {

  open$: BehaviorSubject<boolean>;

  constructor(private readonly service: FloatingNavService) { }

  ngOnInit(): void {
    this.open$ = this.service.open$;
  }

}
