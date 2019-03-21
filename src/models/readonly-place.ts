import { PlaceType } from "../enums/place-type";
import { Place } from "./place";
import { Coordinate } from "./coordinate";

export class ReadOnlyPlace {
    private place: Place;

    constructor(place: Place | null) {
        if (place)
            this.place = place;
        else
            this.place = new Place();
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
    public get left(): ReadOnlyPlace {
        if (this.place.left)
            return new ReadOnlyPlace(this.place.left);
        return new ReadOnlyPlace(null);
    }
    public get right(): ReadOnlyPlace {
        if (this.place.right)
            return new ReadOnlyPlace(this.place.right);
        return new ReadOnlyPlace(null);
    }
    public get top(): ReadOnlyPlace {
        if (this.place.top)
            return new ReadOnlyPlace(this.place.top);
        return new ReadOnlyPlace(null);
    }
    public get bottom(): ReadOnlyPlace {
        if (this.place.bottom)
            return new ReadOnlyPlace(this.place.bottom);
        return new ReadOnlyPlace(null);
    }
}
