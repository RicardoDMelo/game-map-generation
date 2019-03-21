import { PlaceType } from "../enums/place-type";
import { Coordinate } from "./coordinate";

export class Place {
    public type: PlaceType = PlaceType.Empty;
    public get coordinate(): Coordinate {
        return { x: this.x, y: this.y };
    }
    public x: number = 0;
    public y: number = 0;
    public left: Place | null = null;
    public right: Place | null = null;
    public top: Place | null = null;
    public bottom: Place | null = null;

    constructor() {
        this.type = PlaceType.Empty;
    }
}
