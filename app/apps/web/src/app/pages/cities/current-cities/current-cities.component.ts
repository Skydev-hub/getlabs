import { Component, OnInit } from '@angular/core';
import { CitiesService, CitiesByMarket } from '@app/ui';

@Component({
  selector: 'app-current-cities',
  templateUrl: './current-cities.component.html',
  styleUrls: ['./current-cities.component.scss']
})
export class CurrentCitiesComponent implements OnInit {
  public markets: CitiesByMarket[];

  constructor(private readonly citiesService: CitiesService) {}

  ngOnInit() {
    this.citiesService.getCitiesByMarket().subscribe(resp => {
      this.markets = resp.data;
    });
  }
}
