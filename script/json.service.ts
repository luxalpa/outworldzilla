import { Injectable } from "@angular/core";
import { Http } from "@angular/http";

@Injectable()
export class JSONService {
    private jsonfiles: Map<string, any> = new Map<string, any>();

    constructor(private http: Http) {

    }

    getFile(filepath: string): Promise<any> {
        return new Promise(accept => {
            if(this.jsonfiles.has(filepath)) {
                accept(this.jsonfiles.get(filepath));
            }
            this.http.get("/json/" + filepath).map(x => x.json()).subscribe((d) => {
                this.jsonfiles.set(filepath, d);
                accept(d);
            })
        });
    }
}