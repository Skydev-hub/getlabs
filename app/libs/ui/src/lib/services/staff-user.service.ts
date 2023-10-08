import { Injectable } from "@angular/core";
import { StaffUser } from "../models";
import { UserCrudService } from "./user-crud.service";


@Injectable({
  providedIn: "root"
})
export class StaffUserService extends UserCrudService<StaffUser> {
  getResourceType() {
    return StaffUser;
  }

  getResourceEndpoint(): string {
    return "user/staff";
  }
}
