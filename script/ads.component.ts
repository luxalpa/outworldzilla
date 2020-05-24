import { Component, ViewChild, TemplateRef, ElementRef } from "@angular/core";
import { ModalService } from "./modal.service";
import { DonationsService } from "./donations.service";
import { RoutingService } from "./routing.service";

@Component({
    selector: "advertisement",
    template: `<template #modal>

<div class="form medium">
<div style="text-align: left">Enter the name to be shown on this website alongside your donation:<br><div style="text-align: center; margin-top: 10px;"><input type="text" maxlength="22" style="padding: 4px; width: 250px; text-align: center; font-size: 25px;" [(ngModel)]="username"></div></div><br>

<form action="https://www.paypal.com/cgi-bin/webscr" method="post" target="_blank" ngNoForm #someForm>
<input type="hidden" name="cmd" value="_s-xclick">
<input type="hidden" name="custom" [value]="customData">
<input type="hidden" name="hosted_button_id" value="BNA3PG2NJ6PGU">
<img class="paypal-link" src="https://www.paypalobjects.com/en_US/DE/i/btn/btn_donateCC_LG.gif" border="0" alt="PayPal - The safer, easier way to pay online!" (click)="submitForm()">
<!--<img alt="" border="0" src="https://www.paypalobjects.com/en_US/i/scr/pixel.gif" width="1" height="1">-->
</form></div></template>

<div class="box light donation-container"><div class="donation-banner" (click)="gotoDonations()">Top Supporters:&nbsp;
<ng-container *ngFor="let donation of donationsService.donations$ | async; let last = last">
    <span class="donor">{{donation.name}}</span>: <span class="donation-amount">&euro;{{donation.amount}}</span><template [ngIf]="!last">&nbsp;-&nbsp;</template>
</ng-container></div><div class="donation-button" (click)="openDonationModal()">Donate</div>
</div><br>
`
})
export class AdsComponent {
    @ViewChild("modal") modalTemplate: TemplateRef<any>;
    @ViewChild("someForm") someForm: ElementRef;

    customData: string;
    private _username: string;

    set username(name: string) {
        this._username = name;
        this.customData = JSON.stringify({
            "name": name
        });
    }

    get username() {
        return this._username;
    }

    constructor(private modalService: ModalService, public donationsService: DonationsService, private routingService: RoutingService) {
    }

    submitForm() {
        this.someForm.nativeElement.submit();
    }

    gotoDonations() {
        this.routingService.changeLocation("about/donations");
    }

    openDonationModal() {
        this.modalService.showModal(this.modalTemplate);
        this.modalService.clearRequested$.subscribe(() => this.modalService.clear());
    }
}