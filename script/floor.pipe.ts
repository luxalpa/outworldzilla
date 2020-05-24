import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "floor"
})
export class FloorPipe implements PipeTransform {
    transform(v: number): number {
        return Math.floor(v);
    }
}