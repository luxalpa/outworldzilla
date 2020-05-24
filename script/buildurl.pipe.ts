import { Pipe, PipeTransform } from "@angular/core";
import { RoutingService } from "./routing.service";

@Pipe({
    name: "buildUrl"
})
export class BuildUrlPipe implements PipeTransform {
    transform(url: string, params: string) {
        return RoutingService.buildUrl(url, params);
    }
}