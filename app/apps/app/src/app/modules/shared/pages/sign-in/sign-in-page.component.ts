import { Component, OnInit, Type } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs/operators';
import { StaffUser, SpecialistUser, UserType } from '@app/ui';

@Component({
  templateUrl: './sign-in-page.component.html',
  styleUrls: ['./sign-in-page.component.scss']
})
export class SignInPageComponent implements OnInit {

  public message: string;

  public userType: Type<UserType>;

  public phoneNumber: string;

  private redirectTo: string;

  constructor(private readonly route: ActivatedRoute, private readonly router: Router) { }

  ngOnInit(): void {
    this.userType = this.route.snapshot.data.userType;
    this.message = this.route.snapshot.data.message;

    if (!this.userType) {
      throw new Error(`Sign-In route data must contain 'userType' property!`);
    }

    /* Set the default redirectTo to the route snapshot data */
    this.redirectTo = this.route.snapshot.data.redirectTo;

    /* Preference is for the supplied query parameter, whenever available */
    this.route.queryParamMap.subscribe(params => {
      this.redirectTo = params.get('redirectTo') || this.redirectTo;
      this.phoneNumber = params.get('phoneNumber') || this.phoneNumber;
    });

    if (!this.redirectTo) {
      throw new Error(`Sign-In route data must contain 'redirectTo' property!`);
    }
  }

  isSpecialist(): boolean {
    return this.userType === SpecialistUser;
  }

  isStaff(): boolean {
    return this.userType === StaffUser;
  }

  setPhoneNumber(phoneNumber: string) {
    this.phoneNumber = phoneNumber;
  }

  redirect() {
    this.router.navigateByUrl(this.redirectTo);
  }

  /**
   * Determines if the redirectTo query parameter is present, which is indicative of an ad hoc operation that
   * is outside of the standard flow of operations.
   */
  isAdhocOperation() {
    return !!this.route.snapshot.queryParams.redirectTo;
  }
}
