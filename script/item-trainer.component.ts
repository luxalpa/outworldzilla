import {
    Component,
    animate,
    transition,
    style,
    state,
    trigger,
    ViewChildren,
    QueryList,
    ElementRef,
    keyframes,
    ChangeDetectorRef
} from "@angular/core";
import { JSONService } from "./json.service";
import { shuffle } from "./utility";
import { HighscoresComponent } from "./highscores.component";
import { formCloseAnim } from "./common";

interface IItem {
    id: number,
    name: string,
    components: number[][],
    isRecipe: boolean
}

interface IFloatingItem {
    top: number,
    left: number,
    clickable: boolean,
    isWrong: boolean,
    item: IItem
}

interface IItemHighscore {
    points: number;
    date: Date;
}

@Component({
    selector: "item-trainer",
    template: `<div class="item-trainer">

    <div class="form small dark" [@formCloseAnim] *ngIf="gameState == 'menu'">
        Select the items from the bottom that combine into the item at the top!<br><br>
        <a class="button" (click)="startGame()">Start game!</a>
    </div>

    <div class="form dark" [@formCloseAnim] *ngIf="gameState == 'ingame'" (@formCloseAnim.done)="afterAnimation($event)"
         style="width: 400px; padding: 15px; position: relative;">
        <div style="position: absolute; top: 0; left: 0; visibility: hidden" #container></div>
        <div [@pointsAnim]="points" class="points" tooltip="Your current score"><span class="highlight">{{points}}</span> P</div>
        <div class="box item" [ngClass]="'item-' + currentItemToBuild?.id" style="display: inline-block;" [tooltip]="currentItemToBuild?.name"></div>
        <br><br>
        <div class="item-list">
            <div class="item" *ngFor="let item of itemComponents" #itemComponentSlot></div>
        </div>
        <br><br>
        <div class="item-list">
            <div class="item" *ngFor="let item of itemPool" #itemPoolSlot style="text-align: left"></div>
        </div>
        <div class="floating-item" *ngFor="let floatingItem of floatingItems; let i = index" [style.top]="floatingItem.top+'px'" [style.left]="floatingItem.left+'px'" [ngClass]="'item-' + floatingItem.item.id" [tooltip]="{text: floatingItem.item.name, direction: 'down'}" (click)="clickItem(floatingItem)" [style.cursor]="floatingItem.clickable ? 'pointer' : 'default'" [@itemSpawnAnim] [@wrongAnim]="floatingItem.isWrong"></div>
    </div>
    
    <div class="form medium" [@formCloseAnim] *ngIf="gameState == 'results'" style="margin: 10px auto">
            <highscores #highscores game="item-trainer"></highscores>

            <br><br>
            <a class="button" (click)="startGame()">Play again!</a>

        </div>
</div>`,
    animations: [
        formCloseAnim,
        trigger("itemSpawnAnim", [
            state("void", style({
                opacity: 0,
                transform: "scale(0.8)"
            })),
            state("*", style({
                opacity: 1,
                transform: "scale(1)"
            })),
            transition("void <=> *", animate("200ms ease-in-out")),
        ]),
        trigger("wrongAnim", [
            state("false", style({
                opacity: 1,
                display: "auto"
            })),
            state("true", style({
                opacity: 0,
                display: "none"
            })),
            transition("0 => 1", animate("200ms ease-in-out")),
        ]),
        trigger("pointsAnim", [
            transition("* => *", animate("250ms ease-out", keyframes([
                style({
                    transform: "scale(1)",
                }),
                style({
                    transform: "scale(1.5)",
                }),
                style({
                    transform: "scale(1)",
                })
            ])))
        ])
    ]
})
export class ItemTrainerComponent {
    gameState: string = "menu";
    itemPool: IItem[] = [];
    floatingItems: IFloatingItem[] = [];
    itemComponents: IItem[] = [];
    currentComponents: IItem[] = [];
    remainingComponents: IItem[] = [];
    points: number = 0;
    maxNumItems: number = 50;

    @ViewChildren("itemPoolSlot") itemPoolSlots: QueryList<ElementRef>;
    @ViewChildren("itemComponentSlot") itemComponentSlots: QueryList<ElementRef>;
    @ViewChildren("container") containerElement: QueryList<ElementRef>;
    @ViewChildren("highscores") highscoresCmp: QueryList<HighscoresComponent>;

    randomItemComponents: IItem[];
    allItemsToBuild: IItem[];
    allItems: Map<number, IItem>;

    currentItemToBuild: IItem;
    recipeId: number = -1;

    constructor(private jsonservice: JSONService, private changeDetector: ChangeDetectorRef) {

    }

    ngAfterViewInit() {
        // this.startGame();
    }

    getRelativePosition(elementInner: HTMLElement, elementOuter: HTMLElement) {
        let { top: t1, left: l1 } = elementInner.getBoundingClientRect();
        let { top: t2, left: l2 } = elementOuter.getBoundingClientRect();

        return {
            top: t1 - t2,
            left: l1 - l2
        }
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

    startGame() {
        this.points = 0;
        this.changeGameState("ingame");
        this.allItemsToBuild = [];
        this.randomItemComponents = [];
        let randomItemComponents = new Set<IItem>();
        this.allItems = new Map<number, IItem>();

        this.jsonservice.getFile("items.json").then(d => {
            for(let item of d.items) {
                if(item.isRecipe) {
                    this.recipeId = item.id;
                }
                let realItem: IItem = {
                    name: item.isRecipe ? "Recipe" : item.text,
                    id: item.id,
                    components: item.components,
                    isRecipe: item.isRecipe
                };

                this.allItems.set(item.id, realItem);

                if(item.components.length != 0) {
                    this.allItemsToBuild.push(realItem);
                }
            }

            for(let item of d.items) {
                for(let recipe of item.components) {
                    for(let cid of recipe) {
                        let x = this.allItems.get(cid);
                        if(!x.isRecipe) randomItemComponents.add(x);
                    }
                }
            }

            shuffle(this.allItemsToBuild);
            this.allItemsToBuild.splice(this.maxNumItems);
            this.randomItemComponents = Array.from(randomItemComponents);
            this.showNextItem();
        });
    }

    showNextItem() {
        this.currentComponents = [];
        let item = this.allItemsToBuild.pop();

        this.currentItemToBuild = item;
        let i = Math.floor(Math.random() * item.components.length);
        let components: IItem[] = item.components[i].map(id => this.allItems.get(id));

        this.itemComponents = components;
        this.remainingComponents = [...components];

        let bannedItems: Set<IItem> = new Set<IItem>();
        for(let recipe of item.components) {
            for(let id of recipe) {
                bannedItems.add(this.allItems.get(id));
            }
        }

        let itemPool = [...components];

        let hasRecipe = false;
        for(let item of itemPool) {
            if(item.isRecipe) {
                hasRecipe = true;
                break;
            }
        }

        if(!hasRecipe) {
            itemPool.push({
                id: this.recipeId,
                name: "Recipe",
                components: [],
                isRecipe: true
            });
        }

        while(itemPool.length < 9) {
            let i;
            let v = 0;

            // First we try to reroll 5 times so that we don't skew the probabilities of items that come
            // after the banned item too much.
            do {
                v++;
                i = Math.floor(Math.random() * this.randomItemComponents.length);
            } while(bannedItems.has(this.randomItemComponents[i]) && v < 5);

            while(bannedItems.has(this.randomItemComponents[i])) {
                i = (i + 1) % this.randomItemComponents.length;
            }
            itemPool.push(this.randomItemComponents[i]);
        }

        shuffle(itemPool);
        this.itemPool = itemPool;
        this.floatingItems = [];
    }

    afterAnimation(event) {
        if(event.toState == "void") {
            return;
        }
        this.refillItemPool();
    }

    refillItemPool() {
        let positions = this.itemPoolSlots.map(e => {
            return this.getRelativePosition(e.nativeElement, this.containerElement.first.nativeElement)
        });

        for(let i = 0; i < this.itemPool.length; i++) {
            this.floatingItems.push({
                left: positions[i].left,
                top: positions[i].top,
                clickable: true,
                isWrong: false,
                item: this.itemPool[i]
            });
        }
    }

    clickItem(floatingItem: IFloatingItem) {
        if(!floatingItem.clickable || this.remainingComponents.length == 0 || floatingItem.isWrong)
            return;

        let pos = this.remainingComponents.indexOf(floatingItem.item);

        if(pos == -1) {
            //wrong
            floatingItem.isWrong = true;
            floatingItem.clickable = false;
            this.points -= 50;
            return;
        }

        this.remainingComponents.splice(pos, 1);

        let arr = this.itemComponentSlots.toArray();
        let i = this.currentComponents.length;
        let { left, top } = this.getRelativePosition(arr[i].nativeElement, this.containerElement.first.nativeElement);
        floatingItem.left = left;
        floatingItem.top = top;
        floatingItem.clickable = false;
        this.currentComponents.push(floatingItem.item);
        if(this.currentComponents.length == this.itemComponents.length) {
            setTimeout(() => {
                this.points += 100;
                if(this.allItemsToBuild.length > 0) {
                    this.showNextItem();
                    this.refillItemPool();
                } else {
                    this.endGame();
                }
            }, 300);
        }
    }

    endGame() {
        this.changeGameState("results").then(() => {
            this.highscoresCmp.first.addScore({
                score: this.points
            });
        });

    }
}