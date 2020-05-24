import { Directive, ElementRef, HostListener, Input } from "@angular/core";
import { TooltipService } from "./tooltip.service";

@Directive({
    selector: "[tooltip]"
})
export class TooltipDirective {
    @Input("tooltip") text;

    @HostListener("mouseenter", ["$event"])
    show(event: MouseEvent) {
        if(!this.text) {
            return;
        }
        this.service.show(event.target as HTMLElement, this.text);
    }

    @HostListener("mouseleave", [])
    hide() {
        this.service.hide();
    }

    constructor(el: ElementRef, private service: TooltipService) {
    }
}