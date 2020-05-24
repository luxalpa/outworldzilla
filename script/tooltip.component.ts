import { Component, ElementRef, trigger, transition, animate, state, style } from "@angular/core";
import { ITooltipOptions } from "./tooltip.service";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";

@Component({
    selector: "[tooltip-component]",
    host: {
        "[@anim]": "1",
        "[class]": "options.direction == 'down' ? 'tooltip-down' : 'tooltip'",
        "[style.padding]": "options.padding + 'px'",
        "[innerHTML]": "text",
        "[style.maxWidth]": "options.width == undefined ? '' : options.width + 'px'"
    },
    template: ``,
    animations: [
        trigger("anim", [
            state("void", style({
                opacity: 0,
                transform: "scale(0.8)"
            })),
            state("*", style({
                opacity: 1,
                transform: "scale(1)"
            })),
            transition("* <=> void", animate("120ms ease-in-out"))
        ])
    ]
})
export class TooltipComponent {
    text: SafeHtml;
    x: number = 0;
    y: number = 0;

    options: ITooltipOptions = {};

    constructor(private elementRef: ElementRef, private sanitizer: DomSanitizer) {
    }

    ngAfterViewInit() {
        let d = this.elementRef.nativeElement.getBoundingClientRect();
        let width = d.right - d.left;
        let height = d.bottom - d.top;

        if(this.options.direction == "down") {
            this.elementRef.nativeElement.style.top = (this.y + 22) + "px";
        } else {
            this.elementRef.nativeElement.style.top = (this.y - height - 22) + "px";
        }
        this.elementRef.nativeElement.style.left = (this.x - width / 2) + "px";
    }

    show(x: number, y: number, options: ITooltipOptions) {
        this.options = options;
        if(this.options.padding == undefined) {
            this.options.padding = 6;
        }
        this.text = this.sanitizer.bypassSecurityTrustHtml(options.text);
        this.x = x;
        this.y = y;
    }
}