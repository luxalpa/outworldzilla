import {
    Component,
    ViewChild,
    ViewContainerRef,
    ComponentFactoryResolver,
    Injector,
    AfterViewInit,
    HostListener,
    ElementRef,
    ChangeDetectorRef,
    TemplateRef
} from "@angular/core";
import { Subject, AsyncSubject } from "rxjs";

@Component({
    selector: "modal-component",
    host: {
        "class": "modal"
    },
    template: `<ng-container #container></ng-container>`
})
export class ModalComponent implements AfterViewInit {
    componentOrTemplate: any;
    clearRequested$ = new Subject();
    componentCreated$ = new AsyncSubject();


    @ViewChild("container", { read: ViewContainerRef }) container: ViewContainerRef;

    @HostListener("click", ["$event"])
    hostClick(event: MouseEvent) {
        if(event.target == this.elementRef.nativeElement) {
            this.clearRequested$.next();
        }
    }

    constructor(private factoryResolver: ComponentFactoryResolver, private injector: Injector, private elementRef: ElementRef,
        private changeDetector: ChangeDetectorRef) {

    }

    ngAfterViewInit() {
        if(this.componentOrTemplate instanceof TemplateRef) {
            let viewRef = this.container.createEmbeddedView(this.componentOrTemplate);
            this.componentCreated$.next(viewRef);
            this.componentCreated$.complete();
            viewRef.detectChanges();
        } else {
            let factory = this.factoryResolver.resolveComponentFactory(this.componentOrTemplate);
            let ref = factory.create(this.injector);
            this.container.insert(ref.hostView);
            this.changeDetector.detectChanges();
            this.componentCreated$.next(ref.instance);
            this.componentCreated$.complete();
            ref.changeDetectorRef.detectChanges();
        }

    }
}