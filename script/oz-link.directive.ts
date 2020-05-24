import { Directive, Input, HostListener } from "@angular/core";
import { RoutingService } from "./routing.service";

interface IPath {
    href: string,
    param?: Object
}

interface IPathAsArray extends Array<any> {
    0: string,
    1?: Object
}

@Directive({
    selector: "[oz-link]",
    host: {
        "[href]": "href"
    }
})
export class OZLinkDirective {
    href: string; /// TODO: Make it support Params

    @Input("oz-link") set input(path: IPath | string | IPathAsArray) {
        if(typeof path == "string") {
            this.href = path;
        } else if(path.constructor === Array) {
            this.href = path[0];
        } else {
            this.href = (path as IPath).href;
        }
    };

    constructor(private routingService: RoutingService) {

    }

    @HostListener("click", ["$event"])
    onClick(event) {
        if(event.button !== 0 || event.ctrlKey || event.metaKey) {
            return true;
        }
        this.routingService.changeLocation(this.href);
        return false;
    }
}