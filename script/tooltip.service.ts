import {
    Injectable,
    ComponentFactoryResolver,
    ApplicationRef,
    ComponentRef,
    Injector,
    EmbeddedViewRef
} from "@angular/core";
import { TooltipComponent } from "./tooltip.component";

interface TooltipEntity {
    componentRef: ComponentRef<TooltipComponent>,
    node: Node
}

export interface ITooltipOptions {
    text?: string,
    width?: number,
    padding?: number,
    direction?: "up" | "down" | "auto"
}

@Injectable()
export class TooltipService {

    private activeTooltips: TooltipEntity[] = [];

    constructor(private componentFactoryResolver: ComponentFactoryResolver, private applicationRef: ApplicationRef, private injector: Injector) {
    }

    createTooltip(): TooltipComponent {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(TooltipComponent);
        let componentRef = componentFactory.create(this.injector);
        let componentRootNode = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;

        this.applicationRef.attachView(componentRef.hostView);

        let node = document.body.appendChild(componentRootNode);
        this.activeTooltips.push({ componentRef, node });

        return componentRef.instance;
    }

    removeTooltips() {
        for(let { componentRef } of this.activeTooltips) {
            this.applicationRef.detachView(componentRef.hostView);
        }
        this.activeTooltips = [];
    }

    show(target: HTMLElement, textOrOptions: string | ITooltipOptions) {
        let options = typeof textOrOptions == "string" ? {text: textOrOptions} : textOrOptions;

        let { left: x, top: y, right: r, bottom: b } = target.getBoundingClientRect();
        x += (r - x) / 2 + window.scrollX;
        y += window.scrollY;
        if(options.direction == "down") {
            y = b + window.scrollY;
        }
        this.showAtPosition(x, y, options);
    }

    showAtPosition(x: number, y: number, textOrOptions: string | ITooltipOptions) {
        if(this.activeTooltips.length > 0) {
            this.hide();
        }
        let tooltip = this.createTooltip();
        let options = typeof textOrOptions == "string" ? {text: textOrOptions} : textOrOptions;
        tooltip.show(x, y, options);
    }

    hide() {
        this.removeTooltips();
    }
}