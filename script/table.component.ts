import { Component, Input } from "@angular/core";

@Component({
    selector: "oz-table",
    template: `<div [class.inline-center]="center"><div class="box" style="display: inline-block; vertical-align: top;"><table class="abstract-table" [class.stretch]="stretch"><ng-content></ng-content></table></div></div>`
})
export class TableComponent {
    @Input() stretch: boolean = false;
    @Input() center: boolean = true;
}