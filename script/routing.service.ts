import { Injectable } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute, Params } from "@angular/router";
import { path2tabgroup, ITabDesc, path2absolutePath, appRoutes } from "./app.routing";
import { Observable, Subject, ConnectableObservable } from "rxjs";
import { PlatformLocation } from "@angular/common";

export interface IRoutingEvent {
    pages: ITabDesc[],
    rawUrl: string,
    params: Object
}

@Injectable()
export class RoutingService {
    routingEvent$: Observable<IRoutingEvent>;
    routingDirection$: ConnectableObservable<string>;

    private _locationChange$ = new Subject<string>();

    constructor(private router: Router, private route: ActivatedRoute, private location: PlatformLocation) {
        router.resetConfig(appRoutes);

        let routingUrl$ = this.router.events.filter(event => event instanceof NavigationEnd).map((n: NavigationEnd) => n.urlAfterRedirects).take(1).map(url => url.slice(1));
        this.routingDirection$ = Observable.merge(this._locationChange$, routingUrl$)
            .map(url => path2tabgroup.get(url).findIndex(page => page.path == url))
            .pairwise()
            .map(([prev, cur]) => prev > cur ? "rtl" : "ltr")
            .publishReplay(1);

        this.routingDirection$.connect();

        this.routingEvent$ = this.router.events.filter(event => event instanceof NavigationEnd).map(event => {
            let currentRoute = this.route.root;
            let path: string[] = [];
            let params: Params = {};
            while(currentRoute = currentRoute.firstChild) {
                params = currentRoute.snapshot.params; // reassign so we get only the param of the last subroute
                path.push(currentRoute.routeConfig.path);
            }
            let p = path.join("/");
            return {
                pages: path2tabgroup.get(p),
                rawUrl: p,
                params: params,
            };
        }).publishReplay(1).refCount();
    }

    static makeAbsolutePath(path: string): string {
        return path2absolutePath.get(path) || path;
    }

    changeLocation(url: string, params?: Object): void {
        this._locationChange$.next(RoutingService.makeAbsolutePath(url));
        setTimeout(() => {
            this.router.navigateByUrl(url);
        });

    }

    static buildUrl(rawUrl: string, params: Object): string {
        let invalidParameter = false;
        let href = rawUrl.replace(/:([A-Za-z-_]+)/g, (match, p1) => {
            if(!params.hasOwnProperty(p1)) {
                invalidParameter = true;
            }
            return params[p1];
        });
        if(invalidParameter) {
            return "";
        }
        return href;
    }
}