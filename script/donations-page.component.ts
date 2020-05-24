import { Component } from "@angular/core";
import { DonationsService } from "./donations.service";

(function (i, s, o, g, r, a?, m?) {
    i['GoogleAnalyticsObject'] = r;
    i[r] = i[r] || function () {
            (i[r].q = i[r].q || []).push(arguments)
        }, i[r].l = 1 * <any>new Date();
    a = s.createElement(o),
        m = s.getElementsByTagName(o)[0];
    a.async = 1;
    a.src = g;
    m.parentNode.insertBefore(a, m)
})(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');


@Component({
    selector: "donations-page",
    template: `<oz-table>
    <tr>
        <th>Name</th>
        <th>Amount</th>
    </tr>
    <tr *ngFor="let donation of donations.donations$ | async">
        <td style="font-weight: bold;">{{donation.name}}</td>
        <td>€ {{donation.amount}}</td>
    </tr>
</oz-table>`
})
export class DonationsPageComponent {
    constructor(public donations: DonationsService) {

    }
}