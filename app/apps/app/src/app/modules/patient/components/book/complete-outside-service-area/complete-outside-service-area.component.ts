import { Component, OnInit, Optional } from '@angular/core';
import { BookingFlowService } from '../../../services/booking-flow.service';
import { AuthService, PatientUser, PatientUserService } from '@app/ui';
import { ActivatedRoute } from '@angular/router';
import { BookPageComponent } from '../../../pages/book/book-page.component';

@Component({
  selector: 'app-complete-outside-service-area',
  templateUrl: './complete-outside-service-area.component.html',
  styleUrls: ['./complete-outside-service-area.component.scss']
})
export class CompleteOutsideServiceAreaComponent implements OnInit {
  user: PatientUser;

  constructor(
    @Optional() private bookPageComponent: BookPageComponent,
    private bookingService: BookingFlowService,
    private userService: PatientUserService,
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  ngOnInit() {
    this.user = this.route.snapshot.data.user;
    if (this.user && this.bookingService.address) {
      this.userService.update(this.user.id, { address: this.bookingService.address }).subscribe(user => this.auth.freshen(user));
    }
  }
}
