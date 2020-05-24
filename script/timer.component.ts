import { Component, Output, EventEmitter, Input } from "@angular/core";
import { Observable } from "rxjs";
import moment from "moment";

@Component({
    selector: "timer",
    template: `{{timer$ | async}}`
})
export class TimerComponent {
    @Output() done: EventEmitter<any> = new EventEmitter();
    @Input() start: number = 10000;
    @Input() interval: number = 40;
    @Input() format: string = "mm:ss:SS";

    timer$: Observable<string>;

    ngOnInit() {
        this.stopTimer();
    }

    public restartTimer() {
        this.timer$ = Observable.timer(0, this.interval)
            .map(x => {
                let v = this.start - this.interval * x;
                return v > 0 ? v : 0;
            })
            .take(Math.ceil(this.start / this.interval)+1)
            .map(typeof this.format == "string" ? (x => moment(x).format(this.format)) : this.format)
            .do(null, null, () => {
                this.done.emit(null);
            });
    }

    public startTimer() {
        this.restartTimer();
    }

    public stopTimer() {
        this.timer$ = Observable.of((typeof this.format == "string" ? (x => moment(x).format(this.format)) : this.format)(this.start));
    }
}