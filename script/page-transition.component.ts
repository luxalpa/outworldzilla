import {
    animate,
    transition,
    style,
    trigger,
    Component,
    OnDestroy,
    ComponentFactoryResolver,
    Injector,
    ViewContainerRef,
    ViewChild,
    AnimationTransitionEvent,
    ChangeDetectorRef,
    ElementRef,
    OnInit,
    TemplateRef
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription, Subject, Observable } from "rxjs";
import { getBoundingRect } from "./utility";
import { RoutingService } from "./routing.service";

const animDuration = 250;

@Component({
    selector: "[page-transition]",
    template: `<div [style.position]="position" style="width: 100%; box-sizing: border-box;" #element><ng-container #div></ng-container></div>`,
    host: {
        "[@anim]": "direction",
        "(@anim.start)": "animationStarted($event)",
        "(@anim.done)": "animationEnded($event)",
        // "[style.position]": "position"
    },
    animations: [
        trigger("anim", [
            transition("void => ltr", [style({
                transform: "translateX(100%)",
            }), animate(animDuration + "ms ease-in-out")]),
            transition("ltr => void", [animate(animDuration + "ms ease-in-out", style({
                transform: "translateX(-100%)",
            }))]),
            transition("void => rtl", [style({
                transform: "translateX(-100%)",
            }), animate(animDuration + "ms ease-in-out")]),
            transition("rtl => void", [animate(animDuration + "ms ease-in-out", style({
                transform: "translateX(100%)",
            }))])
        ])
    ]
})
export class PageTransitionComponent implements OnDestroy, OnInit {

    @ViewChild("div", { read: ViewContainerRef }) viewContainer: ViewContainerRef;
    @ViewChild("element") element: ElementRef;

    sub: Subscription = new Subscription();
    position: string = "relative";
    direction: string;
    height$: Subject<number>;
    destroyComponent$ = new Subject();
    template: TemplateRef<any>;
    isOutlet: boolean = true;
    direction$: Observable<string>; // gets applied by tabbox-component for template
    componentRef;

    constructor(private route: ActivatedRoute, private componentFactoryResolver: ComponentFactoryResolver,
                private injector: Injector, private changeDetectorRef: ChangeDetectorRef, private routingService: RoutingService) {
        this.destroyComponent$.take(1).subscribe(() => {
            this.height$.next(getBoundingRect(this.element).height);
            this.position = "absolute";
            this.changeDetectorRef.detectChanges();
        });
    }

    ngOnInit() {
        if(this.isOutlet) {
            let dirSub = this.routingService.routingDirection$.subscribe(d => {
                this.direction = d;
            });
            this.sub.add(dirSub);
        } else {
            let dirSub = this.direction$.subscribe(d => {
                this.direction = d;
            });
            this.sub.add(dirSub);
        }
    }

    init(height$: Subject<number>) {
        this.height$ = height$;
        if(this.isOutlet) {
            let sub = this.route.data.subscribe(data => {
                let d = <any>data;
                if(!d.component) {
                    console.error("Errror: No Component in route data!");
                    return;
                }
                let componentFactory = this.componentFactoryResolver.resolveComponentFactory(d.component);
                let componentRef = componentFactory.create(this.injector);
                this.componentRef = componentRef;
                this.viewContainer.insert(componentRef.hostView);
            });

            if(this.sub) {
                this.sub.add(sub);
            } else {
                this.sub = sub;
            }
        } else {
            this.viewContainer.createEmbeddedView(this.template);
        }
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    animationStarted(event: AnimationTransitionEvent) {
        if(event.fromState != "void" || !event.toState) {
            return;
        }
        this.position = "absolute";
        setTimeout(() => { // leave 1 frame so that the CSS-Transition can actually detect a difference
            this.height$.next(getBoundingRect(this.element).height);
        });
    }

    animationEnded(event: AnimationTransitionEvent) {
        if(event.fromState != "void") {
            return;
        }
        this.position = "relative";
        this.height$.next(null);
    }
}