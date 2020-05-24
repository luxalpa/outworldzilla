import {
    Component,
    Input,
    TemplateRef,
    ViewChild,
    ContentChildren,
    QueryList,
    Output,
    EventEmitter,
    ElementRef,
    ChangeDetectorRef
} from "@angular/core";
import { ModalService } from "./modal.service";

interface ISetting {
    tooltip: string;
    text: string;
}

@Component({
    selector: "setting",
    template: "<template></template>"
})
export class SettingComponent {
    @Input() text: string = "";
    @Input() tooltip: string;

    @Input() set value(v) {
        this._value = v;
        this.valueChange.emit(this._value);
    }

    get value() {
        return this._value;
    }

    @Input() type: string;
    @Input() min: number;
    @Input() max: number;
    @Output() valueChange: EventEmitter<any> = new EventEmitter();
    private _value: any;
}

@Component({
    selector: "settings",
    template: `<oz-table>
    <tr *ngFor="let setting of settings">
        <td [tooltip]="setting.tooltip" [innerHTML]="setting.text"></td>
        <td [ngSwitch]="setting.type" class="setting-value" tooltip="" *ngIf="currentEdit != setting"
            (click)="editSetting(setting)">
            <ng-container *ngSwitchCase="'number'">{{setting.value}}</ng-container>
            <ng-container *ngSwitchCase="'string'">{{setting.value}}</ng-container>
            <ng-container *ngSwitchCase="'key'">{{setting.value | keyboardkey}}</ng-container>
            <ng-container *ngSwitchCase="'boolean'"><span [ngClass]="setting.value ? 'color-true' : 'color-false'">{{setting.value ? "&#xf00c;" : "&#xf00d;"}}</span></ng-container>
        </td>
        <td [ngSwitch]="setting.type" class="setting-edit" *ngIf="currentEdit == setting">
            <ng-container *ngSwitchCase="'number'">
                <input type="number" [(ngModel)]="setting.value" #input
                       (blur)="stopEditing()" (keydown)="stopEditingOnEnter($event)" [min]="setting.min" [max]="setting.max">
            </ng-container>
            <ng-container *ngSwitchCase="'string'">
                <input type="text" [(ngModel)]="setting.value" #input
                       (blur)="stopEditing()" (keydown)="stopEditingOnEnter($event)">
            </ng-container>
            <ng-container *ngSwitchCase="'key'">
                <span (window:keydown)="setToKey($event)" style="color: #64d864;">Press key&hellip;</span>
            </ng-container>
        </td>
    </tr>
</oz-table>
`
})
export class SettingsComponent {
    @ContentChildren(SettingComponent) settingComponents: QueryList<SettingComponent>;
    settings: SettingComponent[] = [];
    currentEdit: SettingComponent;

    @ViewChild("input") inputElement: ElementRef;
    @ViewChild("keyInputTemplate") keyInputTemplate: TemplateRef<any>;

    constructor(private changeDetector: ChangeDetectorRef, private modalService: ModalService) {
    }

    ngOnInit() {

    }

    ngAfterContentInit() {
        this.settings = this.settingComponents.toArray();
        for(let setting of this.settings) {
            if(!setting.type) {
                setting.type = typeof setting.value;
            }
        }
    }

    stopEditingOnEnter(event: KeyboardEvent) {
        if(event.keyCode == 13) {
            this.stopEditing();
        }
    }

    stopEditing() {
        // Check if input is valid!

        this.currentEdit = null;
    }

    setToKey(event: KeyboardEvent) {
        this.currentEdit.value = event.keyCode;
        this.currentEdit = null;
    }

    editSetting(setting) {
        switch(setting.type) {
            case "key":
                this.currentEdit = setting;
                break;
            case "boolean":
                setting.value = !setting.value;
                break;
            default:
                this.currentEdit = setting;

                this.changeDetector.detectChanges();
                setTimeout(() => {
                    this.inputElement.nativeElement.focus();
                    this.inputElement.nativeElement.select();
                });
        }
    }
}