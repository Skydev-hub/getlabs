import { Injectable } from "@angular/core";
import { SpecialistUser } from "../models";
import { UserCrudService } from "./user-crud.service";

@Injectable({
  providedIn: "root"
})
export class SpecialistUserService extends UserCrudService<SpecialistUser> {

  getResourceType() {
    return SpecialistUser;
  }

  getResourceEndpoint(): string {
    return "user/specialist";
  }

}
