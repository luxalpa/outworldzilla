import {
    Component,
    trigger,
    state,
    style,
    transition,
    animate,
    ViewChild,
    ElementRef,
    ViewChildren,
    QueryList,
    ChangeDetectorRef
} from "@angular/core";
import { HSVtoRGB } from "./utility";
import { IScoreStat, HighscoresComponent } from "./highscores.component";
import { formCloseAnim } from "./common";

interface Target {
    x: number;
    y: number;
}

interface Highscore {
    points: number;
    date: Date;
    rank: number;
    duration: number;
    misses: number;
}

@Component({
    selector: "mouse-accuracy-trainer",
    template: `<div class="mouse-box dark" #mouseBoxElement (click)="clickedBrackground()">
        <div class="form small" [@formCloseAnim] *ngIf="gameState == 'menu'">
            Click the targets as quickly as you can!<br><br>
            <settings>
                <setting text="Number of targets" [tooltip]="{text: 'The number of targets that appear and that you need to click on before getting to the scoreboard.', width: 200}" [(value)]="numTotalTargets" min="1" max="1000" type="number"></setting>
            </settings>
            <br>
            <a class="button" (click)="startGame()">Start game!</a>
        </div>
        <div class="form medium" [@formCloseAnim] *ngIf="gameState == 'results'" style="margin: 10px auto">
            <highscores #highscores game="mouse-accuracy-trainer" [scoreStats]="scoreStats"></highscores>

            <br><br>
            <div class="button-box">
                <a (click)="startGame()">Play again!</a><a (click)="gotoMenu()" class="settings-button"></a>
            </div>

        </div>
        <div class="target" *ngFor="let target of targets" (click)="clickedTarget($event, target)"
             [style.top]="target.y + 'px'" [style.left]="target.x + 'px'" [@targetAnimation]></div>
</div>`,

    animations: [
        formCloseAnim,
        trigger("targetAnimation", [
            state("*", style({
                transform: "scale(1)",
                opacity: 1
            })),
            state("void", style({
                opacity: 0,
                transform: "scale(0)"
            })),
            transition("* <=> void", animate("100ms ease-in-out"))
        ])
    ]
})

export class MouseAccuracyTrainerComponent {
    gameState: string = "menu";
    numMisses: number;
    numRemainingTargets: number;
    targets: Target[];
    duration: number;
    startTime: any;
    points: number;
    missPercentage: number;
    numTotalTargets: number = 30;
    scoreStats: IScoreStat[] = [
        {
            name: "duration",
            text: "Timing",
            displayFunction: x => Math.floor(x) + "ms"
        },
        {
            name: "misses",
            text: "Miss",
            displayFunction: x => "<span style=\"color:" + this.getMissColor(x) + "\">" + Math.floor(x) + "%</span>"
        }
    ];

    @ViewChild("mouseBoxElement") mouseBoxElement: ElementRef;
    @ViewChildren("highscores") highscoresCmp: QueryList<HighscoresComponent>;

    constructor(private changeDetector: ChangeDetectorRef) {

    }

    startGame() {
        this.numMisses = 0;
        this.numRemainingTargets = this.numTotalTargets;
        this.targets = [];
        this.spawnTarget();
        this.startTime = new Date();

        setTimeout(() => { // use a timeout so that we don't register this as a click
            this.gameState = "ingame";
        })
    }

    clickedTarget(event, target: Target) {

        // Remove Target
        this.targets.splice(this.targets.indexOf(target), 1);

        // Spawn a new target
        if(this.numRemainingTargets > 0)
            this.spawnTarget();
        else {
            this.checkIfOver();
        }

        event.stopPropagation();
    }

    spawnTarget() {
        const padding = 20;

        let x = Math.random() * (this.mouseBoxElement.nativeElement.clientWidth - padding * 2) + padding;
        let y = Math.random() * (this.mouseBoxElement.nativeElement.clientHeight - padding * 2) + padding;
        this.targets.push({ x, y });
        this.numRemainingTargets--;
    }

    checkIfOver() {
        if(this.numRemainingTargets == 0 && this.targets.length == 0) {
            this.endGame();
        }
    }

    getMissColor(n: number) {
        if(n == undefined) {
            return "";
        }
        const max = 50;
        if(n > max) n = max;
        let h = (1 / 3) - n / max / 3;
        let color = HSVtoRGB(h, 1, 1);
        return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
    }

    endGame() {
        this.targets = [];
        this.duration = Math.floor((<any>new Date() - this.startTime) / this.numTotalTargets);
        this.gameState = "results";
        this.missPercentage = this.numMisses / this.numTotalTargets * 100;
        this.points = 1000000 / this.duration - 1000000 / this.duration * (this.numMisses / (this.numTotalTargets * 2));
        this.changeDetector.detectChanges();
        this.highscoresCmp.first.addScore({
            score: this.points,
            stats: {
                duration: this.duration,
                misses: this.missPercentage
            }
        });

    }

    gotoMenu() {
        this.gameState = "";
        setTimeout(() => {
            this.gameState = "menu";
        }, 250);
    }

    clickedBrackground() {
        if(this.gameState == "ingame") {
            this.numMisses++;
        }
    }
}