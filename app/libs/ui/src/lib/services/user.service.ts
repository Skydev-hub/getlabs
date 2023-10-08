import { Injectable, Type } from "@angular/core";
import { Observable } from "rxjs";
import { PatientUser, SpecialistUser, StaffUser, User, UserType } from "../models/user";
import { PatientUserService } from "./patient-user.service";
import { SpecialistUserService } from "./specialist-user.service";
import { StaffUserService } from "./staff-user.service";
import { UserCrudService } from "./user-crud.service";

const InvalidUserError = (type: Type<User> | string) => new Error(`"${ type }" is not a valid User class type`);

@Injectable({
  providedIn: "root"
})
export class UserService {

  private readonly types = { PatientUser, SpecialistUser, StaffUser };

  constructor(private patients: PatientUserService, private specialists: SpecialistUserService, private staff: StaffUserService) { }

  getClassType(type: string): Type<UserType> {
    if (!this.types[type]) {
      throw InvalidUserError(type);
    }

    return this.types[type];
  }

  getPortalUrl(type: Type<User> | string): string {
    switch (typeof type === "string" ? this.getClassType(type) : type) {
      case PatientUser:
        return "/";
      case SpecialistUser:
        return "/care";
      case StaffUser:
        return "/team";
      default:
        throw InvalidUserError(type);
    }
  }

  getService(type: Type<User> | string): UserCrudService<User> {
    switch (typeof type === "string" ? this.getClassType(type) : type) {
      case PatientUser:
        return this.patients;
      case SpecialistUser:
        return this.specialists;
      case StaffUser:
        return this.staff;
      default:
        throw InvalidUserError(type);
    }
  }

  get(type: Type<User> | string, id: string): Observable<User> {
    return this.getService(type).read(id);
  }
}
