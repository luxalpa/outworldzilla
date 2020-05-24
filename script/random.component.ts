import { Component, ViewChild, TemplateRef } from "@angular/core";
import { ModalService } from "./modal.service";

@Component({
    selector: "random-component",
    template: `
<!--<div style="height: 250px; width: 500px; box-shadow: 2px 2px 8px black; padding: 10px; display: flex; align-items: center; justify-content: center">-->
    <!--This is going to be a page!-->
<!--</div>-->

<tabbox style="display: inline-block; width: 360px">
    <page name="First Page">First Page
        <div style="background-color: #040; height: 300px;"></div>
    </page>
    <page name="Second Page">Second Page
        <div style="background-color: #420; height: 150px;"></div>
    </page>
</tabbox>
<br><br>

Key Code: {{myKeyCode}}

<settings>
    <setting type="key" [(value)]="myKeyCode" text="This is the key setting!"></setting>
</settings>


<a class="button" [oz-link]="'ability-trainer'">Change</a><br><br>

`,
})

export class RandomComponent {
    @ViewChild("someTemplate") someTemplate: TemplateRef<any>;
    myKeyCode: any;

    constructor(modalService: ModalService) {

    }

    ngAfterContentInit() {
        // console.log(this.someTemplate);
    }
}

@Component({
    selector: "other-component",
    template: `<div style="width: 100%; height: 200px; background-color: #f44;"></div>`
})
export class OtherComponent {

}