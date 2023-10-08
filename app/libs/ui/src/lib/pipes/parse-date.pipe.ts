import { Pipe, PipeTransform } from "@angular/core";
import { parse } from "date-fns";

@Pipe({
  name: "parseDate"
})
export class ParseDatePipe implements PipeTransform {

  transform(value: string, format: string): Date {
    return parse(value, format, new Date());
  }

}
