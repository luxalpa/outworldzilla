import { Component, Input, ElementRef, ChangeDetectorRef, ViewChildren, QueryList } from "@angular/core";
import { TooltipService } from "./tooltip.service";
import { makeNiceNumber, getRange } from "./utility";
import { Observable, ReplaySubject, Subscription } from "rxjs";

interface Label {
    x: number;
    y: number;
    text: string;
}

interface IData extends Array<any> {
    0: any,
    1: number,
    2: any
}

interface IGraphData {
    data: IData,
    labels: {
        x: Label[],
        y: Label[]
    },
    circles: Circle[],
    intervalPx: number,
    gridlines: string[],
    graph: string
}

interface Circle {
    x: number,
    y: number
}

@Component({
    selector: "graph",
    template: `<svg [style.width.px]="width" [style.height.px]="height" [attr.width]="width" [attr.height]="height" class="graph" #svgElement *ngIf="(dataChanges$ | async).length > 1">
    <polyline *ngFor="let p of (graphData$ | async).gridlines" fill="none" stroke="grey" stroke-width="1" [attr.points]="p" class="grid" shape-rendering="crispEdges"/>
    <text *ngFor="let label of (graphData$ | async).labels.y" [attr.x]="label.x" [attr.y]="label.y" text-anchor="end" alignment-baseline="middle">{{label.text}}</text>
    <text *ngFor="let label of (graphData$ | async).labels.x" [attr.x]="label.x" [attr.y]="label.y" text-anchor="middle" alignment-baseline="hanging">{{label.text}}</text>
    <polyline fill="none" stroke="#0074d9" [attr.points]="(graphData$ | async).graph" class="line"/>
    <circle *ngFor="let c of (graphData$ | async).circles" r="5" [attr.cx]="c.x" [attr.cy]="c.y"/>
</svg>
    <div class="not-enough-data" *ngIf="(dataChanges$ | async).length <= 1" [style.width.px]="width" [style.height.px]="height">Not enough data!</div>

`
})
export class GraphComponent {
    @Input("data") set data(d: IData[]) {
        this.dataChanges$.next(d);
    }

    @Input() width: number;
    @Input() height: number;
    offsetX: number = 20;
    offsetY: number = 20;
    padding: number = 20;
    dataChanges$ = new ReplaySubject<IData[]>(1);
    graphData$: Observable<IGraphData>;
    tooltipSubscription: Subscription;

    @ViewChildren("svgElement") svgElementQ: QueryList<ElementRef>;

    constructor(private tooltipService: TooltipService, private changeDetector: ChangeDetectorRef) {
        this.graphData$ = this.dataChanges$.filter(d => d.length > 1).map(d => this.updateGraph(d)).publishReplay().refCount();
    }

    ngAfterViewInit() {
        this.tooltipSubscription = this.svgElementQ.changes
            .startWith(this.svgElementQ)
            .filter((d: QueryList<ElementRef>) => d.length > 0)
            .switchMap((d: QueryList<ElementRef>) => {
                let element = d.first.nativeElement;

                let mouseleave$ = Observable.fromEvent(element, "mouseleave");

                return Observable.fromEvent(element, "mousemove")
                    .withLatestFrom(this.graphData$, (mm: MouseEvent, d: IGraphData) => {
                        let i = Math.floor((mm.offsetX - this.padding - this.offsetX + (d.intervalPx / 2)) / d.intervalPx);
                        if(i < 0) i = 0;
                        else if(i >= d.data.length) i = d.data.length - 1;
                        return i;
                    }).distinctUntilChanged()
                    .takeUntil(mouseleave$)
                    .withLatestFrom(this.graphData$, (i: number, d: IGraphData) => {
                        let c = d.circles[i];
                        let {top, left} = element.getBoundingClientRect();
                        let [key, value, description] = d.data[i];
                        this.tooltipService.showAtPosition(c.x + left, c.y + top, {
                            text:`<table class="page-table tooltip-table"><tr><th>${description || key}</th></tr><tr><td>${value}</td></tr></table>`,
                            padding: 0
                        });
                    })
                    .do(null, null, () =>  this.tooltipService.hide())
                    .repeat()
            }).subscribe();

        this.tooltipSubscription.add(this.dataChanges$.subscribe(() => this.tooltipService.hide()));
    }

    updateGraph(data): IGraphData {
        const gridsizeY: number = 100;
        const gridsizeX: number = 40;
        const innerRect = {
            left: this.offsetX + this.padding,
            top: this.offsetY + this.padding,
            width: this.width - (this.offsetX + this.padding * 2),
            height: this.height - (this.offsetY + this.padding * 2)
        };

        let dataRange = getRange(data.map(([, d]) => d));

        const maxNumGridlines = {
            vertical: innerRect.width / gridsizeX,
            horizontal: innerRect.height / gridsizeY + 1
        };

        const gridInterval = {
            y: makeNiceNumber((dataRange.max - dataRange.min) / maxNumGridlines.horizontal),
            x: Math.ceil(data.length / maxNumGridlines.vertical)
        };

        // adjust the data range to improve the graph axis
        if(dataRange.min == dataRange.max) {
            const newExtreme = makeNiceNumber(dataRange.min);
            if(newExtreme > 0) {
                gridInterval.y = newExtreme;
                dataRange = {
                    min: 0,
                    max: newExtreme
                }
            } else if(newExtreme < 0) {
                gridInterval.y = -newExtreme;
                dataRange = {
                    min: newExtreme,
                    max: 0
                }
            } else {
                gridInterval.y = 100;
                dataRange = {
                    min: -100,
                    max: 100
                }
            }
        } else {
            dataRange.min = Math.floor(dataRange.min / gridInterval.y) * gridInterval.y;
        }

        const convertToPixels = {
            x: innerRect.width / (data.length - 1),
            y: innerRect.height / (dataRange.max - dataRange.min)
        };

        const startY = this.height - this.padding - this.offsetY;
        const startX = this.padding + this.offsetX;

        const endY = this.padding;
        const endX = this.width - this.padding;

        let gridlines = [];
        let labels = {
            x: [],
            y: []
        };

        // Horizontal Lines and Labels

        for(let y = startY, i = dataRange.min; y >= endY; y -= gridInterval.y * convertToPixels.y, i += gridInterval.y) {
            gridlines.push("0," + y + " " + this.width + "," + y);
            labels.y.push({
                x: this.offsetX + this.padding - 5,
                y: y + 2,
                text: i.toString()
            });
        }

        // Vertical Lines and Labels

        for(let x = startX, i = 0; x <= endX; x += gridInterval.x * convertToPixels.x, i += gridInterval.x) {
            const label = data[i][0];
            gridlines.push(x + ",0 " + x + "," + this.height);
            labels.x.push({
                x: x,
                y: startY + 8,
                text: label
            })
        }

        // Data Points

        let points = [];
        let circles = [];

        for(let x = 0; x < data.length; x++) {
            const y = data[x][1];

            const drawX = startX + x * convertToPixels.x;
            const drawY = Math.floor(startY - (y - dataRange.min) * convertToPixels.y) + 0.5;

            points.push(drawX + "," + drawY);
            circles.push({ x: drawX, y: drawY });
        }

        return {
            circles,
            graph: points.join(" "),
            gridlines,
            intervalPx: convertToPixels.x,
            labels,
            data: data
        };
    }

    ngOnDestroy() {
        this.dataChanges$.complete();
        this.tooltipSubscription.unsubscribe();
    }
}