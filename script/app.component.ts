import { Component } from "@angular/core";
import { RoutingService } from "./routing.service";
import { Observable } from "rxjs";
import { ResizeService } from "./resize.service";
import { ITabDesc } from "./app.routing";
import { Title } from "@angular/platform-browser";

@Component({
    selector: "[outworldzilla]",
    template: `<!--<div id="logo-big-od" pointer-events="none"></div>-->
<advertisement></advertisement>
<div id="logo"></div>
<div small-main-menu *ngIf="(windowSize.width$ | async) < 1154"></div>
<div id="container">
    <main-menu id="main-menu" *ngIf="(windowSize.width$ | async) >= 1154"></main-menu>

    <div>
        <tabbox type="light" id="main-tabbar" [isOutlet]="true" [class.tabs-middle]="(windowSize.width$ | async) < 1154">
            <page *ngFor="let page of pageEvent$ | async" [name]="page.name" [href]="page.path"></page>
        </tabbox>
    </div><div class="privacy-link"><a oz-link="about/privacy">Privacy Policy</a> | Copyright &copy; 2017 by Smaug | This website is not affiliated with Valve.</div>
</div>
`
})
export class AppComponent {
    pageEvent$: Observable<ITabDesc[]>;

    constructor(private routingService: RoutingService, public windowSize: ResizeService, titleService: Title) {
        this.pageEvent$ = routingService.routingEvent$.pluck("pages");
        routingService.routingEvent$.subscribe((d) => titleService.setTitle(d.pages.find((page) => page.path == d.rawUrl).name + " - Outworldzilla"));
    }
}