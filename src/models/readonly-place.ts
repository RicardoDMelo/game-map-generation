import { PlaceType } from "../enums/place-type";
import { Place } from "./place";
import { Coordinate } from "./coordinate";

export class ReadOnlyPlace {
    private place: Place;

    constructor(place: Place) {
        this.place = place;
    }

    public get type(): PlaceType {
        return this.place.type;
    }
    public get coordinate(): Coordinate {
        return { x: this.x, y: this.y };
    }
    public get x(): number {
        return this.place.x;
    }
    public get y(): number {
        return this.place.y;
    }
    public get left(): ReadOnlyPlace | null {
        if (this.place.left)
            return new ReadOnlyPlace(this.place.left);
        return null;
    }
    public get right(): ReadOnlyPlace | null {
        if (this.place.right)
            return new ReadOnlyPlace(this.place.right);
        return null;
    }
    public get top(): ReadOnlyPlace | null {
        if (this.place.top)
            return new ReadOnlyPlace(this.place.top);
        return null;
    }
    public get bottom(): ReadOnlyPlace | null {
        if (this.place.bottom)
            return new ReadOnlyPlace(this.place.bottom);
        return null;
    }
}
