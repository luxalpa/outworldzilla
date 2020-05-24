import {
    Component,
    trigger,
    state,
    style,
    transition,
    animate,
    keyframes,
    HostListener,
    ViewChildren,
    QueryList,
    ChangeDetectorRef
} from "@angular/core";
import { TimerComponent } from "./timer.component";
import moment from "moment";
import { HighscoresComponent } from "./highscores.component";
import { formCloseAnim } from "./common";

interface IFloatingSkill {
    id: number,
    reagentIDs: number[]
}

interface IFloatingBuff {
    id: number
}

@Component({
    selector: "invoke-trainer",
    template: `<div class="invoke-trainer">
    <div class="form small" [@formCloseAnim] *ngIf="gameState == 'menu'">
        Invoke the spells as quickly as possible!<br><br>
        <settings>
            <setting text="Time (seconds)" [(value)]="totalTime" tooltip="Total time until the game ends"></setting>
            <setting text="Hotkey for <span class='highlight-bold'>Quas</span>" [(value)]="hotkeyQuas" type="key"></setting>
            <setting text="Hotkey for <span class='highlight-bold'>Wex</span>" [(value)]="hotkeyWex" type="key"></setting>
            <setting text="Hotkey for <span class='highlight-bold'>Exort</span>" [(value)]="hotkeyExort" type="key"></setting>
            <setting text="Hotkey for <span class='highlight-bold'>Invoke</span>" [(value)]="hotkeyInvoke" type="key"></setting>
        </settings>
        <br>
        <a class="button" (click)="startGame()">Start game!</a>
    </div>

    <div class="form small" [@formCloseAnim] *ngIf="gameState == 'ingame'">
        <timer class="invoke-timer" [start]="totalTime * 1000" [format]="formatTimer" (done)="endGame()" #timer tooltip="Your remaining time"></timer>
        <div class="points" tooltip="Your current score" [@pointsAnim]="score"><span class="highlight">{{score | floor}}</span> P</div>
        <div class="invoke-list"><div>
            <div *ngFor="let skill of skillsToInvoke; let i = index" class="floating-skill ability-medium" [ngClass]="'ability-'+skill.id" [style.bottom]="(6 + i * (64 + 6)) + 'px'" [style.visibility]="i == 3 ? 'hidden' : ''" [@popAnim]></div></div>
        </div><br><br>
        <div style="position: relative; display: inline-block; height: 22px;"><div class="floating-buff" 
            *ngFor="let buff of floatingBuffs; let i = index" [ngClass]="'ability-'+buff.id" [style.top]="0" [style.left.px]="(-35 + i * 35 - 10)" 
            [@invokeAnimSuccess]="invokeAnimationTriggerSuccess" [@invokeAnimFailure]="invokeAnimationTriggerFailure" [@buffSpawnAnim]></div></div>
        <br>
        <div class="invoke-buttons" [@invokeAnimSuccess]="invokeAnimationTriggerSuccess" [@invokeAnimFailure]="invokeAnimationTriggerFailure">
            <a class="ability-5370" (click)="reagent(0)">{{hotkeyQuas | keyboardkey}}</a><a class="ability-5371" (click)="reagent(1)">{{hotkeyWex | keyboardkey}}</a><a class="ability-5372" (click)="reagent(2)">{{hotkeyExort | keyboardkey}}</a><a class="ability-5375" (click)="invoke()">{{hotkeyInvoke | keyboardkey}}</a>
        </div><br><br>
        
    </div>
    
    <div class="form medium" [@formCloseAnim] *ngIf="gameState == 'results'">
            <highscores #highscores game="item-trainer"></highscores>

            <br><br>
            <div class="button-box">
                <a (click)="startGame()">Play again!</a><a (click)="gotoMenu()" class="settings-button"></a>
            </div>

        </div>
</div>`,
    animations: [
        formCloseAnim,
        trigger("popAnim", [
            state("*", style({
                transform: "scale(1)"
            })),
            state("void", style({
                transform: "scale(0)"
            })),
            transition("* => void", animate("200ms ease-in-out")),
        ]),
        trigger("pointsAnim", [
            transition("* => *", animate("180ms ease-out", keyframes([
                style({
                    transform: "scale(1)",
                }),
                style({
                    transform: "scale(1.3)",
                }),
                style({
                    transform: "scale(1)",
                })
            ])))
        ]),
        trigger("buffSpawnAnim", [
            state("*", style({
                opacity: 1,
                transform: "scale(1)"
            })),
            state("void", style({
                opacity: 0,
                transform: "scale(0)"
            })),
            transition("* <=> void", animate("200ms ease-in-out")),
        ]),
        trigger("invokeAnimSuccess", [
            transition("1 <=> 0", animate("280ms ease-out", keyframes([
                style({
                    borderColor: "#0e9595",
                }),
                style({
                    borderColor: "#0f0",
                }),
                style({
                    borderColor: "#0e9595",
                })
            ])))
        ]),
        trigger("invokeAnimFailure", [
            transition("1 <=> 0", animate("280ms ease-out", keyframes([
                style({
                    borderColor: "#0e9595",
                }),
                style({
                    borderColor: "#f00",
                }),
                style({
                    borderColor: "#0e9595",
                })
            ])))
        ]),
    ]
})
export class InvokeTrainerComponent {
    totalTime: number = 60;
    hotkeyQuas: number = 81; // Q
    hotkeyWex: number = 87; // W
    hotkeyExort: number = 69; // E
    hotkeyInvoke: number = 82; // R

    gameState: string = "menu";

    skillsToInvoke: IFloatingSkill[] = [];
    floatingBuffs: IFloatingBuff[] = [];
    score: number;

    invokeAnimationTriggerSuccess: boolean = false;
    invokeAnimationTriggerFailure: boolean = false;

    @ViewChildren("highscores") highscoresCmp: QueryList<HighscoresComponent>;
    @ViewChildren("timer") timer: QueryList<TimerComponent>;

    invokes: [number, number[]][] = [
        [5383, [5371, 5371, 5371].sort()], // EMP
        [5384, [5371, 5371, 5372].sort()], // Alacrity
        [5385, [5371, 5372, 5372].sort()], // Chaos Meteor
        [5376, [5370, 5370, 5370].sort()], // Cold Snap
        [5390, [5370, 5371, 5372].sort()], // Deafening Blast
        [5387, [5370, 5372, 5372].sort()], // Forge Spirit
        [5381, [5370, 5370, 5371].sort()], // Ghost Walk
        [5389, [5370, 5370, 5372].sort()], // Ice Wall
        [5386, [5372, 5372, 5372].sort()], // Sun Strike
        [5382, [5371, 5371, 5370].sort()] // Tornado
    ];

    constructor(private changeDetector: ChangeDetectorRef) {
        // console.log(moment);
    }

    ngAfterViewInit() {

    }

    formatTimer(x) {
        return Math.floor(moment.duration(x).asSeconds()) + moment(x).format(":SS");
    }

    getRandomSkill(): IFloatingSkill {
        let r: number;

        let oldSkill = this.skillsToInvoke[this.skillsToInvoke.length-1];
        if(oldSkill) {
            let breakingPoint = this.invokes.findIndex(([id]) => oldSkill.id == id);
            r = Math.floor(Math.random() * (this.invokes.length-1));

            if(r >= breakingPoint) {
                r++;
            }
        } else {
            r = Math.floor(Math.random() * this.invokes.length);
        }

        let [id, reagentIDs] = this.invokes[r];
        return {
            id,
            reagentIDs
        }
    }

    startGame() {
        this.changeGameState("ingame").then(() => {
            this.timer.first.startTimer();
        });
        this.score = 0;
        this.skillsToInvoke = [];
        this.floatingBuffs = [];
        this.skillsToInvoke.push(this.getRandomSkill());
        this.skillsToInvoke.push(this.getRandomSkill());
        this.skillsToInvoke.push(this.getRandomSkill());
        this.skillsToInvoke.push(this.getRandomSkill());
    }

    invoke() {
        let currentSkill: IFloatingSkill = this.skillsToInvoke[0];
        let skillIDs = this.floatingBuffs.map(x => x.id).sort();
        let isRight = true;
        if(currentSkill.reagentIDs.length > skillIDs.length) {
            isRight = false;
        } else {
            for(let i = 0; i < currentSkill.reagentIDs.length; i++) {
                if(currentSkill.reagentIDs[i] != skillIDs[i]) {
                    isRight = false;
                }
            }
        }

        if(isRight) {
            this.invokeAnimationTriggerSuccess = !this.invokeAnimationTriggerSuccess;
            this.advance();
        } else {
            this.invokeAnimationTriggerFailure = !this.invokeAnimationTriggerFailure;
        }

    }

    advance() {
        this.score += 6000 / this.totalTime;
        this.skillsToInvoke.splice(0, 1);
        this.skillsToInvoke.push(this.getRandomSkill());
    }

    reagent(n: number) {
        if(this.floatingBuffs.length >= 3) {
            this.floatingBuffs.splice(0, 1);
        }
        this.floatingBuffs.push({
            id: [5370, 5371, 5372][n]
        });
    }

    endGame() {
        this.changeGameState("results").then(() => {
            this.highscoresCmp.first.addScore({
                score: this.score
            });
        });
    }

    changeGameState(newState: string) {
        return new Promise(accept => {
            this.gameState = "";
            setTimeout(() => {
                this.gameState = newState;
                this.changeDetector.detectChanges();
                accept();
            }, 101);
        });
    }

    gotoMenu() {
        this.changeGameState("menu");
    }

    @HostListener('document:keydown', ['$event'])
    checkKey(e) {
        if(this.gameState != "ingame")
            return;
        let key = e.keyCode;
        if(key == this.hotkeyQuas)
            this.reagent(0);
        if(key == this.hotkeyWex)
            this.reagent(1);
        if(key == this.hotkeyExort)
            this.reagent(2);
        if(key == this.hotkeyInvoke)
            this.invoke();

    }
}