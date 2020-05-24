import { Injectable } from "@angular/core";
import { setStorage, getStorage } from "./utility";

interface IGameScores {
    allScores: IScore[],
    highscores: IScore[]
}

export interface IScore {
    score: number,
    date?: Date,
    stats?: Object;
}

const sortScore = (a: IScore, b: IScore) => {
    if(a.score > b.score) {
        return -1;
    } else if(a.score < b.score) {
        return 1;
    } else {
        return 0;
    }
}

@Injectable()
export class HighscoresService {
    gameScores: Map<string, IGameScores> = new Map<string, IGameScores>();

    constructor() {
        this.addGame("item-trainer");
        this.addGame("mouse-accuracy-trainer");

        // TODO: Load scores

    }

    private addGame(game: string) {
        let allScores: IScore[] = getStorage("highscores", game);
        let highscores: IScore[];

        if(allScores) {
            allScores.forEach((value: IScore, index: number) => {
                allScores[index].date = new Date(value.date);
            });

            highscores = [...allScores];
            highscores.sort(sortScore);
            if(highscores.length > 10)
                highscores.length = 10;
        } else {
            allScores = [];
            highscores = [];
        }

        this.gameScores.set(game, {
            allScores: allScores,
            highscores: highscores
        })
    }

    addScore(game: string, score: IScore): number {
        let g = this.gameScores.get(game);
        g.allScores.push(score);
        setStorage("highscores", game, g.allScores);

        g.highscores.push(score);
        g.highscores.sort(sortScore);

        if(g.highscores.length > 10) {
            g.highscores.pop();
        }

        return g.highscores.indexOf(score) + 1;
    }

    getHighscores(game: string): IScore[] {
        let g = this.gameScores.get(game);
        let arr = [];

        for(let i = 0; i < g.highscores.length; i++) {
            let s = g.highscores[i];
            arr.push(s);
        }

        while(arr.length < 10) {
            arr.push({});
        }

        return arr;
    }

    getAllScores(game: string): IScore[] {
        let g = this.gameScores.get(game);
        return g.allScores;
    }
}