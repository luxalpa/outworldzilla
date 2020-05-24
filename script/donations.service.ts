import { Injectable } from "@angular/core";
import { Http } from "@angular/http";
import { Observable, ReplaySubject } from "rxjs";

export interface IDonation {
    amount: string,
    name: string
}

@Injectable()
export class DonationsService {
    public donations$: Observable<IDonation[]>;

    constructor(private http: Http) {
        let replaySubject = new ReplaySubject(1);

        http.get("http://api.outworldzilla.net/donations").map(d => d.json()).map(rawDonations => {
            rawDonations.sort(([,cur], [,next]) => cur < next ? 1: -1);
            return rawDonations.map(([name, amount]: [string, number]) => {
                return {name, amount: (amount / 100).toFixed(2)};
            });
        }).subscribe(replaySubject);

        this.donations$ = replaySubject;
    }
}