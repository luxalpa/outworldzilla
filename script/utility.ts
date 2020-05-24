import { ElementRef } from "@angular/core";
/** Seperates intermangled arrays.
 * [[1,2],[3,4],[5,6]] => [[1,3,5],[2,4,6]]
 * @param arr - Array to be transposed*/
export function transpose<T>(arr: T[][]): T[][] {
    return arr[0].map(function (_, c) { return arr.map(function (r) { return r[c]; }); });
}

export function HSVtoRGB(h, s, v) {
    let r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t; b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

/**
 * Shuffles array in place. ES6 version
 * @param {Array} a items The array containing the items.
 */
export function shuffle(a: any[]) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}

interface IRect {
    width: number,
    height: number,
    left: number,
    right: number,
    top: number,
    bottom: number
}

export function getBoundingRect(e: ElementRef): IRect {
    let x = e.nativeElement.getBoundingClientRect();
    return Object.assign({
        width: x.right - x.left,
        height: x.bottom - x.top
    }, x);
}

export function makeNiceNumber(n: number): number {
    if(n > 0) {
        let numDigits = Math.floor(Math.log10(n));
        let firstDigit = Math.floor(n / Math.pow(10, numDigits));
        firstDigit = roundTo5(firstDigit);
        return firstDigit * Math.pow(10, numDigits);
    } else if(n < 0) {
        n = Math.abs(n);
        let numDigits = Math.floor(Math.log10(n));
        let firstDigit = Math.floor(n / Math.pow(10, numDigits));
        firstDigit = roundTo5(firstDigit+1);
        return -firstDigit * Math.pow(10, numDigits);
    } else {
        return 0;
    }
}

export function roundTo5(n: number): number {
    if(n >= 4 && n <= 7)
        return 5;
    if(n >= 8)
        return 10;
    if(n == 3)
        return 2;
    return n;
}

export function getRange(data): { min: number, max: number } {
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;

    for(let d of data) {
        if(d < min)
            min = d;
        if(d > max)
            max = d;
    }

    return { min, max };
}

export function setStorage(group: string, key: string, data: any, online: boolean = false) {
    if(online) {
        console.error("Online storage is not yet supported!");
        return;
    }

    window.localStorage.setItem(group + "." + key, JSON.stringify(data));
}

export function getStorage(group: string, key: string): any {
    return JSON.parse(window.localStorage.getItem(group + "." + key));
}