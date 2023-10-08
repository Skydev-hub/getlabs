import { Injectable } from "@angular/core";
import { Provider } from "../models/provider.dto";
import { CrudService } from "./crud.service";

@Injectable({
  providedIn: "root"
})
export class ProviderService extends CrudService<Provider> {

  getResourceType() {
    return Provider;
  }

  getResourceEndpoint(): string {
    return "provider";
  }

}
