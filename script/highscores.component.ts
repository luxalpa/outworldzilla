import { Component, Input } from "@angular/core";
import { HighscoresService, IScore } from "./highscores.service";
import { SafeHtml, DomSanitizer } from "@angular/platform-browser";

export interface IScoreStat {
    name: string,
    text: string,
    displayFunction?: (any) => string;
}

@Component({
    selector: "highscores",
    template: `Well Done!<br><br>
                <oz-table>
                    <tr>
                        <th>#</th>
                        <th>Points</th>
                        <th *ngFor="let stat of scoreStats">{{stat.text}}</th>
                    </tr>
                    <tr>
                        <td>{{rank ? rank : "-"}}</td>
                        <td>{{score?.score | floor}}</td>
                        <td *ngFor="let stat of scoreStats" [innerHTML]="sanitizeStat(stat, score?.stats)"></td>
                    </tr>
                </oz-table><br>
            Highscores:
            <br><br>
            <tabbox style="display: inline-block; vertical-align: top; width: 360px" class="centered">
                <page name="Highscores">
                    <div>
                        <table class="page-table">
                            <tr>
                                <th>#</th>
                                <th>Score</th>
                                <th *ngFor="let stat of scoreStats">{{stat.text}}</th>
                                <th>Date</th>
                            </tr>
                            <tr *ngFor="let h of highscores; let i = index" [class.highlighted]="rank == i+1">
                                <td>{{i+1}}</td>
                                <td>{{h.score != undefined ? (h.score | floor) : "-"}}</td>
                                <td *ngFor="let stat of scoreStats" [innerHTML]="sanitizeStat(stat, h.stats)"></td>
                                <td>{{h.date != undefined ? h.date.toLocaleString() : "-"}}</td>
                            </tr>
                        </table>
                    </div>
                </page>
                <page name="Progress">
                    <div style="height: 256px; width: 358px">
                        <graph height="256" width="358" [data]="graphData"></graph>
                    </div>
                </page>
            </tabbox>`
})
export class HighscoresComponent {
    @Input() game: string;
    @Input() scoreStats: IScoreStat[];

    score: IScore;
    highscores: IScore[] = [];

    graphData: [string, number, string][] = [];
    rank: number;

    sanitizeStat(stat: IScoreStat, value: any): SafeHtml {
        let name = stat.name;
        let str = "";
        if(!value) {
            str = "-";
        } else {
            if(stat.displayFunction) {
                str = stat.displayFunction(value[name]);
            } else {
                str = value[name];
            }
        }

        return this._sanitizer.bypassSecurityTrustHtml(str);
    }

    constructor(private highscoresService: HighscoresService, private _sanitizer: DomSanitizer) {

    }

    public addScore(score: IScore) {
        if(!score.date) score.date = new Date();
        this.score = score;
        this.rank = this.highscoresService.addScore(this.game, score);
        this.highscores = this.highscoresService.getHighscores(this.game);
        this.updateGraphData();
    }

    updateGraphData() {
        let newGraphData = [];

        let rank = 1;
        for(let {score, date} of this.highscoresService.getAllScores(this.game)) {
            newGraphData.push([rank.toString(), Math.floor(score), date.toLocaleString()]);
            rank++;
        }

        this.graphData = newGraphData;
    }
}