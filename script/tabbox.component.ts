import {
    Component,
    Input,
    ViewChildren,
    AfterViewInit,
    QueryList,
    ContentChildren,
    TemplateRef,
    ViewChild,
    ElementRef,
    Injector,
    ComponentFactoryResolver,
    ViewContainerRef,
    ComponentRef,
    ChangeDetectorRef,
    OnDestroy
} from "@angular/core";
import { Router, RoutesRecognized } from "@angular/router";
import { RoutingService, IRoutingEvent } from "./routing.service";
import { Subscription, Subject, BehaviorSubject, Observable, ReplaySubject, ConnectableObservable } from "rxjs";
import { PageTransitionComponent } from "./page-transition.component";
import { ResizeService } from "./resize.service";
import { getBoundingRect } from "./utility";
import { ModalService } from "./modal.service";
import { TabMenuComponent } from "./tab-menu.component";

export interface IPage {
    name: string,
    href: string,
    template: TemplateRef<any>
}

@Component({
    selector: "page",
    template: `<template><ng-content></ng-content></template>`
})
export class PageComponent implements IPage {
    @ViewChild(TemplateRef) template: TemplateRef<any>;
    @Input() name: string = "";
    @Input() href: string = "";
}

@Component({
    selector: "tabbox",
    template: `<div class="tabbox">
    <ul class="tabbar" [ngClass]="type$ | async" #tabbar>
        <ng-container *ngIf="useShortTabbar$ | async">
            <li class="selected short-tabbar">
                <a (click)="openSmallMenu()">{{(currentPage$ | async)?.name}}<span class="icon" style="margin-left: 10px; font-weight: normal">&#xf078;</span></a>
            </li>
        </ng-container>
        <ng-container *ngIf="!(useShortTabbar$ | async)">
            <li *ngFor="let page of pages$ | async" [class.selected]="page == (currentPage$ | async)">
                <a *ngIf="isOutlet$ | async" [oz-link]="page.href" >{{page.name}}</a>
                <a *ngIf="!(isOutlet$ | async)" (click)="changePage(page)">{{page.name}}</a>
            </li>
        </ng-container>
    </ul>
    <div class="tabbox-content" [ngClass]="type$ | async" #tabboxContent>
        <div [style.height.px]="height$ | async">
            <ng-container *ngIf="!(isOutlet$ | async)" #templateContainer></ng-container>
            <router-outlet *ngIf="isOutlet$ | async" (activate)="onActivate($event)"></router-outlet>
        </div>
    </div>
</div>
`
})
export class TabboxComponent implements AfterViewInit, OnDestroy {
    isOutlet$ = new BehaviorSubject<boolean>(false);
    pages$ = new ReplaySubject<IPage[]>(1);
    type$ = new BehaviorSubject<string>("dark");
    currentPage$ = new ReplaySubject<IPage>(1);
    useShortTabbar$: Observable<boolean>;
    subscriptions: Subscription;
    height$ = new Subject();
    destroyCurrentComponent$: Subject<{}>;
    currentTemplate$: Subject<ComponentRef<PageTransitionComponent>>;
    params = null;
    templateDirection$: ConnectableObservable<string>;

    @ViewChild("tabbar") tabbar: ElementRef;
    @ViewChild("tabboxContent") tabboxContent: ElementRef;
    @ViewChildren("templateContainer", { read: ViewContainerRef }) templateContainer: QueryList<ViewContainerRef>;

    @ContentChildren(PageComponent) pageComponents: QueryList<PageComponent>;

    @Input("type") set type(t: string) {
        if(["dark", "light"].indexOf(t) == -1) {
            console.error(`ERROR: "${t}" is not a valid box-type for TabboxComponent.`);
            return;
        }
        this.type$.next(t);
    }

    @Input() set isOutlet(v: boolean) {
        this.isOutlet$.next(v);
    }

    @Input() set selection(i: number) {
        this.pages$.take(1).subscribe(pages => {
            this.currentPage$.next(pages[i]);
        });
    }

    constructor(private routingService: RoutingService,
                private componentFactoryResolver: ComponentFactoryResolver, private injector: Injector,
                private changeDetector: ChangeDetectorRef, private resizeService: ResizeService,
                private modalService: ModalService, router: Router) {

        let switchedToRouter = this.isOutlet$.filter(v => v == true);
        let switchedToTemplate = this.isOutlet$.filter(v => v == false);

        // Current Page $

        let routerCurrentPage$ = Observable.combineLatest(routingService.routingEvent$, this.pages$, (event: IRoutingEvent, pages: IPage[]) => {
            return pages.find(page => page.href == event.rawUrl);
        }).filter(p => p !== undefined);
        this.subscriptions = switchedToRouter.switchMap(() => routerCurrentPage$.takeUntil(switchedToTemplate))
            .subscribe(page => {
                this.currentPage$.next(page);
            });

        let templateCurrentPage$ = this.pages$.map((pages: IPage[]) => pages[0]).filter(p => p != undefined);
        let templateCurrentPageSub = switchedToTemplate.switchMap(() => templateCurrentPage$.takeUntil(switchedToRouter))
            .subscribe(page => {
                this.currentPage$.next(page);
            });
        this.subscriptions.add(templateCurrentPageSub);

        this.templateDirection$ = switchedToTemplate.switchMap(
            () => Observable.merge(
                this.currentPage$.skip(1).withLatestFrom(this.pages$, (page: IPage, pages: IPage[]) => pages.indexOf(page)),
                this.currentPage$.combineLatest(this.pages$, (page: IPage, pages: IPage[]) => pages.indexOf(page)).take(1)
            )
                .pairwise()
                .map(([prev, cur]) => prev > cur ? "rtl" : "ltr")
                .takeUntil(switchedToRouter))
            .publishReplay(1);
        this.templateDirection$.connect();

        let templateCreationSub = switchedToTemplate
            .switchMap(() => this.currentPage$.takeUntil(switchedToRouter))
            .map(page => {
                let componentFactory = this.componentFactoryResolver.resolveComponentFactory(PageTransitionComponent);
                let componentRef = componentFactory.create(this.injector);
                let cmp = componentRef.instance;
                cmp.isOutlet = false;
                cmp.template = page.template;
                cmp.init(this.height$);
                cmp.direction$ = this.templateDirection$;
                this.templateContainer.first.insert(componentRef.hostView);

                if(this.destroyCurrentComponent$)
                    this.destroyCurrentComponent$.next();
                this.destroyCurrentComponent$ = cmp.destroyComponent$;
                return componentRef;
            }).scan((oldRef, newRef) => {
                this.changeDetector.detectChanges();
                oldRef.destroy();
                return newRef;
            }).subscribe();
        this.subscriptions.add(templateCreationSub);

        // Destroy Component $

        let routerDestroyComponent$ = router.events
            .filter(e => e instanceof RoutesRecognized && this.destroyCurrentComponent$ !== undefined);
        let destroyComponentSub = switchedToRouter.switchMap(() => routerDestroyComponent$.takeUntil(switchedToTemplate))
            .subscribe((e: RoutesRecognized) => {
                this.destroyCurrentComponent$.next();
            });

        this.subscriptions.add(destroyComponentSub);
    }

    ngAfterViewInit() {
        let resetTabbar$ = new Subject();

        let tabbarWidth$ = this.pageComponents.changes
            .startWith(this.pageComponents)
            .map(d => d.toArray())
            .do(p => this.pages$.next(p))
            .map(() => {
                resetTabbar$.next();
                this.changeDetector.detectChanges();
                return getBoundingRect(this.tabbar).width;
            }).share();

        let contentWidth$ = this.resizeService.width$.map(t => {
            return getBoundingRect(this.tabboxContent).width;
        });

        let useShortTabbar1$ = Observable.combineLatest(tabbarWidth$, contentWidth$, (tabbarWidth, contentWidth) => tabbarWidth >= contentWidth);
        this.useShortTabbar$ = Observable.merge(useShortTabbar1$, resetTabbar$.mapTo(false));

        this.changeDetector.detectChanges();
    }

    changePage(page: IPage) {
        // Gets called only in template mode
        this.currentPage$.next(page);
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    openSmallMenu() {
        this.modalService.showModal(TabMenuComponent).subscribe((cmp: TabMenuComponent) => {
            this.pages$.take(1).subscribe(pages => {
                cmp.tabs = pages;
            })
        });
        this.modalService.clearRequested$.subscribe(() => {
            this.modalService.clear();
        })
    }

    onActivate(cmp: PageTransitionComponent) {
        cmp.init(this.height$);
        this.destroyCurrentComponent$ = cmp.destroyComponent$;
    }
}