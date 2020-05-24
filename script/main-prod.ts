import "./polyfills";
import { enableProdMode } from "@angular/core";
import { platformBrowser } from "@angular/platform-browser";
import { AppModuleNgFactory } from "../tmp/app.module.ngfactory";

enableProdMode();

declare var process; // might brake minification

//(<any>window).translation = process.env.translation;
let hn = window.location.hostname;
(<any>window).server = "http://api." + hn + (hn == "localhost" ? ":3500" : "");

platformBrowser().bootstrapModuleFactory(AppModuleNgFactory);