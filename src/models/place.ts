import { PlaceType } from "../enums/place-type";

export class Place {
    public type: PlaceType = PlaceType.Empty;
    public x: number = 0;
    public y: number = 0;
    public left: Place | null = null;
    public right: Place | null = null;
    public top: Place | null = null;
    public bottom: Place | null = null;
}
