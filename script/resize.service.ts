import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable()

export class ResizeService {
    width$: Observable<number>;
    height$: Observable<number>;

    constructor() {
        let windowSize$ = Observable.fromEvent(window, "resize")
            .map(getWindowSize)
            .startWith(getWindowSize())
            .publishReplay(1)
            .refCount();
        this.width$ = (windowSize$.pluck("width") as Observable<number>).distinctUntilChanged();
        this.height$ = (windowSize$.pluck("height") as Observable<number>).distinctUntilChanged();
    }


}

function getWindowSize() {
    return {
        width: window.innerWidth,
        height: window.innerHeight
    }
}