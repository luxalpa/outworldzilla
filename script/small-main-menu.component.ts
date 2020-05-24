import { Component } from "@angular/core";
import { RoutingService } from "./routing.service";
import { path2menu } from "./app.routing";
import { Observable } from "rxjs";
import { ModalService } from "./modal.service";
import { MainMenuComponent } from "./main-menu.component";

@Component({
    selector: "[small-main-menu]",
    host: {
        "id": "small-main-menu"
    },
    template: `<div class="button-box">
    <a (click)="showMenu()">{{currentMenu$ | async}}<span class="icon" style="margin-left: 10px;">&#xf078;</span></a><a class="icon">&#xf007;</a><a class="icon">&#xf013;</a><a class="icon">&#xf002;</a>
</div><br><br>`
})
export class SmallMainMenuComponent {
    currentMenu$: Observable<string>;

    constructor(private routingService: RoutingService, public modalService: ModalService) {
        this.currentMenu$ = this.routingService.routingEvent$.map(event => {
            let menu = path2menu.get(event.rawUrl);
            return menu && menu.text;
        });
    }

    showMenu() {
        this.modalService.showModal(MainMenuComponent);
        this.modalService.clearRequested$.subscribe(() => {
            this.modalService.clear();
        });
    }
}
