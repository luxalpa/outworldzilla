import { Directive, ElementRef, HostListener, Renderer, Input } from "@angular/core";

@Directive({
    selector: "[pointer-events]"
})
export class PointerEventsDirective {
    @Input("pointer-events") value: string;

    constructor(public el: ElementRef, public renderer: Renderer) {

    }

    ngOnChanges() {
        this.renderer.setElementStyle(this.el.nativeElement, "pointer-events", this.value);
    }


    @HostListener("click", ["$event"]) onClick(e: any) {
        if(this.value != "none")
            return;
        let oldDisplay = this.el.nativeElement.style.display; // consider switching off and on the setElementClass instead
        this.renderer.setElementStyle(this.el.nativeElement, "display", "none");
        let elementBelow: any = document.elementFromPoint(e.clientX, e.clientY);
        this.renderer.setElementStyle(this.el.nativeElement, "display", oldDisplay);
        let ne: any = Object.assign({}, e);
        ne.target = elementBelow;
        elementBelow.click(ne);
        return false;
    }
}