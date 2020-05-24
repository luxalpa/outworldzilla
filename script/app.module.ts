import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { appRoutingProviders, routing } from "./app.routing";
import { AppComponent } from "./app.component";
import { RandomComponent, OtherComponent } from "./random.component";
import { PointerEventsDirective } from "./pointer-events.directive";
import { TabboxComponent, PageComponent } from "./tabbox.component";
import { MainMenuComponent, MenuLinkDirective } from "./main-menu.component";
import { RoutingService } from "./routing.service";
import { MouseAccuracyTrainerComponent } from "./mouse-accuracy-trainer.component";
import { HighscoresService } from "./highscores.service";
import { GraphComponent } from "./graph.component";
import { TooltipDirective } from "./tooltip.directive";
import { TooltipService } from "./tooltip.service";
import { TooltipComponent } from "./tooltip.component";
import { SettingsComponent, SettingComponent } from "./settings.component";
import { FormsModule } from "@angular/forms";
import { AbilityTrainerComponent } from "./ability-trainer.component";
import { JSONService } from "./json.service";
import { HttpModule } from "@angular/http";
import { ItemTrainerComponent } from "./item-trainer.component";
import { TableComponent } from "./table.component";
import { InvokeTrainerComponent } from "./invoke-trainer.component";
import { TimerComponent } from "./timer.component";
import { FloorPipe } from "./floor.pipe";
import { HighscoresComponent } from "./highscores.component";
import { PageTransitionComponent } from "./page-transition.component";
import { ResizeService } from "./resize.service";
import { SmallMainMenuComponent } from "./small-main-menu.component";
import { ModalComponent } from "./modal.component";
import { ModalService } from "./modal.service";
import { BuildUrlPipe } from "./buildurl.pipe";
import { TabMenuComponent } from "./tab-menu.component";
import { OZLinkDirective } from "./oz-link.directive";
import { PracticeOverviewComponent } from "./practice-overview.component";
import { KeyboardKeyPipe } from "./keyboardkey.pipe";
import { AdsComponent } from "./ads.component";
import { DonationsService } from "./donations.service";
import { DonationsPageComponent } from "./donations-page.component";
import { AnalyticsService } from "./analytics.service";
import { PrivacyPolicyComponent } from "./privacy-policy.component";
import { NewsComponent } from "./news.component";

const practice = [
    PracticeOverviewComponent,
    MouseAccuracyTrainerComponent,
    AbilityTrainerComponent,
    ItemTrainerComponent,
    InvokeTrainerComponent,
    HighscoresComponent
];

const about = [
    DonationsPageComponent,
    PrivacyPolicyComponent
];

const news = [
    NewsComponent
];

const pages = [...practice, ...about, ...news, RandomComponent, OtherComponent];
const pipes = [FloorPipe, BuildUrlPipe, KeyboardKeyPipe];
const directives = [MenuLinkDirective, PointerEventsDirective, TooltipDirective, OZLinkDirective];
const components = [
    AppComponent,
    TabboxComponent,
    MainMenuComponent,
    PageComponent,
    GraphComponent,
    SettingsComponent,
    SettingComponent,
    TableComponent,
    TimerComponent,
    SmallMainMenuComponent,
    PageTransitionComponent,
    TooltipComponent,
    ModalComponent,
    TabMenuComponent,
    AdsComponent
];

@NgModule({
    imports: [BrowserModule, routing, FormsModule, HttpModule],
    declarations: [...pipes, ...pages, ...components, ...directives],
    providers: [
        appRoutingProviders,
        RoutingService,
        HighscoresService,
        TooltipService,
        JSONService,
        ResizeService,
        ModalService,
        DonationsService,
        AnalyticsService
    ],
    bootstrap: [AppComponent],
    entryComponents: [TooltipComponent, ModalComponent, MainMenuComponent, TabMenuComponent, PageTransitionComponent, ...pages]
})
export class AppModule {
    // make sure the service gets instantiated
    constructor(s: AnalyticsService) {

    }
}