import { Component, OnInit } from '@angular/core';
import { PlacesService } from "../../services/places.service";

@Component({
  selector: 'app-address-lookup',
  templateUrl: './address-lookup.component.html',
  styleUrls: ['./address-lookup.component.scss']
})
export class AddressLookupComponent implements OnInit {

  constructor(public places: PlacesService) { }

  ngOnInit() {
  }

}
