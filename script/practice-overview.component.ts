import { Component } from "@angular/core";
@Component({
    selector: "practice-overview",
    template: `<div class="overview">
    <div class="entry" *ngFor="let entry of entries"><div class="content"><h1>{{entry.title}}</h1><p>{{entry.description}}</p><div class="right"><a [oz-link]="entry.link">Play Game</a></div></div><img [src]="'/img/' + entry.img"></div>
    </div>
`
})
export class PracticeOverviewComponent {

    entries = [
        {
            title: "Mouse Accuracy Trainer",
            description: "Misclicks or just generally slow mouse accuracy? Not anymore! In this game, click on the small target-dots as fast as you can! Then compare your timings to your previous timings. Make sure not to miss any targets though!",
            link: "mouse-accuracy-trainer",
            img: "practice-mouse-accuracy.png"
        },
        {
            title: "Ability Trainer",
            description: "Knowledge is power! Knowing the exact Mana Cost or Cooldown of an enemy or allied move can save you valuable seconds! In this multiple-choice quiz-like game you get to choose the right one between 5 answers.",
            link: "ability-trainer",
            img: "practice-abilities.png"
        },
        {
            title: "Item Trainer",
            description: "Learn how to build Dota 2's items in this Shopkeeper's Quiz-inspired game! Right choices increase your score, wrong choices decrease it.",
            link: "item-trainer",
            img: "practice-items.png"
        },
        {
            title: "Invoker Trainer",
            description: "Want to improve the speed at which you invoke spells as Invoker? Then this game is for you! Invoke as many spells as possible before the time runs out and track your progress!",
            link: "invoke-trainer",
            img: "practice-invoke.png"
        }
    ];

    constructor() {

    }


}