import { Component, Directive, Input, HostListener, HostBinding } from "@angular/core";
import { RoutingService } from "./routing.service";
import { path2menu } from "./app.routing";
import { Subscription } from "rxjs";
import { ModalService } from "./modal.service";

@Directive({
    selector: "[menu-link]",
    host: {
        "[class.selected]": "isActive"
    }
})
export class MenuLinkDirective {

    @HostBinding() href: string;

    @HostListener("click", ["$event"]) onClick(event: any) {
        if(event.button !== 0 || event.ctrlKey || event.metaKey) {
            return true;
        } else {
            this.routingService.changeLocation(this.href);
            this.modalService.clear();
            return false;
        }
    }

    private subscription: Subscription;
    public isActive: boolean;

    constructor(private routingService: RoutingService, private modalService: ModalService) {

    }

    ngOnInit() {
        this.subscription = this.routingService.routingEvent$.map(
            event => path2menu.get(event.rawUrl).prefix == this.href
        ).subscribe(v => this.isActive = v);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    @Input("menu-link") set menuLink(v: string) {
        this.href = v;
    }
}

@Component({
    selector: "main-menu",
    host: {
        "id": "main-menu"
    },

    template: `<div id="menu-staff"><div class="box light" id="menu-box">
    <div class="box light menu-inner-box">
        <div>
            <a class="coming-soon">Coming Soon</a>
            <!--<a class="icon">&#xf007;</a>-->
            <!--<a class="icon">&#xf013;</a>-->
            <!--<a class="icon">&#xf002;</a>-->
        </div>
    </div>
    <br>

    <div class="box light menu-inner-box">

        <div><a class="coming-soon">Coming Soon</a></div>

        <div><a menu-link="news">News</a></div>

        <div><a class="coming-soon">Coming Soon</a></div>

        <div>
            <a menu-link="practice">Practice</a>
        </div>

        <div>
            <a class="coming-soon">Coming Soon</a>
        </div>

        <div>
            <a class="coming-soon">Coming Soon</a>
        </div>

        <div>
            <a class="coming-soon">Coming Soon</a>
        </div>
        
        <div>
            <a menu-link="about">About</a>
        </div>
    </div>
</div>
</div>
`
})
export class MainMenuComponent {

}