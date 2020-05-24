import { animate, transition, style, state, trigger } from "@angular/core";
export const formCloseAnim = trigger("formCloseAnim", [
    state("*", style({
        display: "auto",
        opacity: 1,
        transform: "scale(1)"
    })),
    state("void", style({
        display: "none",
        opacity: 0,
        transform: "scale(0.8)"
    })),
    transition("void <=> *", animate("100ms ease-in-out")),
]);