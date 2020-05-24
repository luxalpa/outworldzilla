import { RouterModule, Route } from "@angular/router";
import { ModuleWithProviders, Component } from "@angular/core";
import { MouseAccuracyTrainerComponent } from "./mouse-accuracy-trainer.component";
import { AbilityTrainerComponent } from "./ability-trainer.component";
import { ItemTrainerComponent } from "./item-trainer.component";
import { InvokeTrainerComponent } from "./invoke-trainer.component";
import { PageTransitionComponent } from "./page-transition.component";
import { PracticeOverviewComponent } from "./practice-overview.component";
import { DonationsPageComponent } from "./donations-page.component";
import { PrivacyPolicyComponent } from "./privacy-policy.component";
import { NewsComponent } from "./news.component";

interface ITabOptions {
    prefix?: string
}

interface ITab extends Array<any>{
    0: string,
    1: string,
    2: Component,
    3?: ITabOptions
}
interface ITabGroup extends Array<any> {
    0: string,
    1: string,
    2: ITab[]
}

let appRoutes: Route[] = [
    { path: "", redirectTo: "/practice/overview", pathMatch: "full"}
];

let tabgroups: ITabGroup[] = [
    // ["Players", "players", [
    //     ["Overview", "overview", RandomComponent],
    //     ["Rankings", "rankings", OtherComponent]
    // ]],
    // ["Players/:player", "players/:player", [
    //     ["Overview", "overview", RandomComponent],
    //     ["Matches", "matches", OtherComponent]
    // ]],
    ["Practice", "practice", [
        ["Overview", "overview", PracticeOverviewComponent],
        ["Mouse Accuracy Trainer", "mouse-accuracy-trainer", MouseAccuracyTrainerComponent, { prefix: "" }],
        ["Ability Trainer", "ability-trainer", AbilityTrainerComponent, { prefix: "" }],
        ["Item Trainer", "item-trainer", ItemTrainerComponent, { prefix: "" }],
        ["Invoker Trainer", "invoke-trainer", InvokeTrainerComponent, { prefix: "" }],
    ]],
    ["About", "about", [
        ["Donations", "donations", DonationsPageComponent],
        ["Privacy Policy", "privacy", PrivacyPolicyComponent]
    ]],
    ["News", "news", [
        ["News", "news", NewsComponent, {prefix: ""}]
    ]]
];

export interface ITabDesc {path: string, name: string}
interface ITabGroupDesc {
    prefix: string,
    text: string
}

let path2tabgroup = new Map<string, ITabDesc[]>();
let path2menu = new Map<string, ITabGroupDesc>();
let path2absolutePath = new Map<string, string>();

function buildTabGroups() {
    for(let [tabgroupName, prefix, tabgroup] of tabgroups) {
        let isFirstTab = true;
        let tabdescgroup = [];

        for(let [name, subpath, component, { prefix: curPrefix = prefix } = {}] of tabgroup) {
            let path: string = curPrefix == "" ? subpath : curPrefix + "/" + subpath;

            appRoutes.push({ path: path, component: PageTransitionComponent, data: { component: component } });
            if(isFirstTab) {
                isFirstTab = false;
                if(curPrefix != "") {
                    appRoutes.push({ path: curPrefix, pathMatch: "full", redirectTo: "/" + path });
                    path2absolutePath.set(curPrefix, path);
                }
            }
            tabdescgroup.push({ path: path, name: name });
            path2menu.set(path, { prefix: prefix, text: tabgroupName });
        }

        for(let tab of tabdescgroup) {
            path2tabgroup.set(tab.path, tabdescgroup);
        }
    }
}

buildTabGroups();

export { path2tabgroup, path2menu, path2absolutePath, appRoutes };

export const appRoutingProviders: any[] = [];

export const routing: ModuleWithProviders = RouterModule.forRoot(appRoutes);