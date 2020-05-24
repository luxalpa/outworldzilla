import { Injectable } from "@angular/core";
import { Router, NavigationEnd } from "@angular/router";

declare let ga: Function;

@Injectable()
export class AnalyticsService {
    constructor(private router: Router) {
        (function(i, s, o, g, r, a?, m?) {
            i['GoogleAnalyticsObject'] = r;
            i[r] = i[r] || function() {
                    (i[r].q = i[r].q || []).push(arguments)
                }, i[r].l = 1 * <any>new Date();
            a = s.createElement(o),
                m = s.getElementsByTagName(o)[0];
            a.async = 1;
            a.src = g;
            m.parentNode.insertBefore(a, m)
        })(window, document, 'script', '//www.google-analytics.com/analytics.js', 'ga');

        ga('create', 'UA-91765278-1', 'auto');

        router.events.filter(e => e instanceof NavigationEnd).subscribe(e => {
            ga("set", "page", e.url);
            ga('send', 'pageview');
        })
    }
}