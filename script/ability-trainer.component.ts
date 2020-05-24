import { Component } from "@angular/core";
import { JSONService } from "./json.service";
import { shuffle } from "./utility";
import { formCloseAnim } from "./common";

interface IQuestion {
    type: string,
    id: number,
    name: string,
    answer: any
}

interface IResult {
    correctAnswers?: number,
    numQuestions?: number
}

const bannedAbilities = [5569,5553,5560,5531,5558,5552,5562,5563,5547,5535,5557,5529,5533,5559,5554,5546,5561,5564,5556,5555,5209];

@Component({
    selector: "ability-trainer",
    template: `<div class="ability-trainer">
    <div class="form small dark" [@formCloseAnim] *ngIf="gameState == 'menu'">
        Guess the spell cooldowns or mana costs! Click on the right answer to advance.<br><br>
        <settings>
            <setting text="Cooldowns" [(value)]="useCooldowns" type="boolean"></setting>
            <setting text="Mana Costs" [(value)]="useManacost" type="boolean"></setting>
            <setting text="Max questions" [(value)]="maxNumQuestions" min="1" type="number"
                     tooltip="Maximum number of questions that<br>you will need to answer"></setting>
        </settings>
        <br>
        <br>
        <a class="button" (click)="startGame()" [class.disabled]="!useCooldowns && !useManacost">Start game!</a>
    </div>
    <div class="form small dark" [@formCloseAnim] *ngIf="gameState == 'ingame'" style="width: 250px;">
        <div class="question">
            <div class="qicon ability-medium" [ngClass]="'ability-' + question?.id"
                 [tooltip]="question?.name"></div>
            <div class="qtext" [ngClass]="question?.type">
                {{formatQuestionType(question?.type)}}
            </div>
        </div>
        <div class="answer vertical-button-box">
            <a *ngFor="let answer of answers; let i = index" class="vbb-button" (click)="selectAnswer(i)"
               [class.wrong]="wrongAnswers[i]">{{answer}}</a>
        </div>
    </div>
    <div class="form small dark" [@formCloseAnim] *ngIf="gameState == 'endgame'">
        {{endgameText(result?.correctAnswers / result?.numQuestions)}}!<br><br> Out of <span class="highlight-bold">{{result?.numQuestions}}</span> questions you got <span
            class="highlight-bold">{{result?.correctAnswers}}</span> correct (<span class="highlight-bold">{{(result?.correctAnswers / result?.numQuestions * 100) | floor}}%</span>)!<br><br>
        <div class="button-box">
            <a (click)="startGame()">Play again!</a><a (click)="gotoMenu()" class="settings-button"></a>
        </div>
    </div>
</div>`,
    animations: [formCloseAnim]
})
export class AbilityTrainerComponent {
    gameState: string = "menu";
    allAnswers: any;
    allQuestions: IQuestion[];
    question: IQuestion;
    answers: any[];
    wrongAnswers: boolean[];
    result: IResult;

    // Settings:
    useCooldowns: boolean = true;
    useManacost: boolean = true;
    maxNumQuestions: number = 30;

    constructor(private jsonService: JSONService) {

    }

    gotoMenu() {
        this.changeGameState("menu");
    }

    endgameText(v: number): string {
        if(v < 0.2) return "Meh";
        if(v < 0.4) return "You still need to learn a lot";
        if(v < 0.6) return "Not too bad";
        if(v < 0.8) return "Good";
        if(v < 0.9) return "Nicely done";
        return "Perfect";
    }

    startGame() {
        if(!this.useCooldowns && !this.useManacost) {
            return;
        }

        this.result = {
            correctAnswers: 0
        };

        this.question = undefined;
        this.answers = [];
        this.jsonService.getFile("abilities.json").then(allAbilities => {
            this.allQuestions = [];
            this.allAnswers = {
                "cd": [],
                "mana": []
            };
            for(let ability of allAbilities.abilities) {
                if(bannedAbilities.indexOf(ability.id) != -1)
                    continue;

                if(this.useCooldowns && ability.cd && ability.cd[0]) {
                    this.allAnswers.cd.push(this.formatAnswer(ability.cd));
                    this.allQuestions.push({
                        type: "cd",
                        id: ability.id,
                        name: ability.text,
                        answer: this.formatAnswer(ability.cd)
                    })
                }

                if(this.useManacost && ability.mana && ability.mana[0]) {
                    this.allAnswers.mana.push(this.formatAnswer(ability.mana));
                    this.allQuestions.push({
                        type: "mana",
                        id: ability.id,
                        name: ability.text,
                        answer: this.formatAnswer(ability.mana)
                    })
                }
            }

            shuffle(this.allQuestions);
            if(this.maxNumQuestions < this.allQuestions.length) {
                this.allQuestions.length = this.maxNumQuestions;
            }

            this.result.numQuestions = this.allQuestions.length;

            this.showQuestion();
        });
        this.changeGameState("ingame");
    }

    formatAnswer(values: any[]): string {
        return values.join(" / ");
    }

    formatQuestionType(type: string): string {
        switch(type) {
            case "cd": return "Cooldown";
            case "mana": return "Mana-Cost"
        }
    }

    selectAnswer(index: number) {
        let answer = this.answers[index];
        if(answer == this.question.answer) {
            let wasWrong: boolean = false;
            for(let wrongAnswer of this.wrongAnswers) {
                if(wrongAnswer) {
                    wasWrong = true;
                    break;
                }
            }

            if(!wasWrong) {
                this.result.correctAnswers += 1;
            }

            if(this.allQuestions.length == 0) {
                this.endGame();
            } else {
                this.changeGameState("ingame").then(() => {
                    this.showQuestion();
                });
            }
        } else {
            this.wrongAnswers[index] = true;
        }
    }

    showQuestion() {
        this.wrongAnswers = [];
        while(this.wrongAnswers.length < 5) {
            this.wrongAnswers.push(false);
        }
        this.question = this.allQuestions.splice(Math.floor(Math.random() * this.allQuestions.length), 1)[0];
        this.answers = [this.question.answer];
        while(this.answers.length < 5) {
            let i = Math.floor(Math.random() * this.allAnswers[this.question.type].length);
            this.answers.push(this.allAnswers[this.question.type][i]);
        }
        shuffle(this.answers);
    }

    endGame() {
        this.changeGameState("endgame");
    }

    changeGameState(newState: string) {
        return new Promise(accept => {
            this.gameState = "";
            setTimeout(() => {
                this.gameState = newState;
                accept();
            }, 101);
        });
    }
}