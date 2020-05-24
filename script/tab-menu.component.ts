import { Component } from "@angular/core";
import { IPage } from "./tabbox.component";

@Component({
    selector: "tab-menu-component",
    template: `<div class="box light">
    <div class="box light menu-inner-box">
        <div *ngFor="let tab of tabs"><a [menu-link]="tab.href">{{tab.name}}</a></div>
    </div>
</div>`
})

export class TabMenuComponent {
    tabs: IPage[];
}