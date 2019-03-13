import { PlaceType } from "../enums/place-type";

export class Place {
    type: PlaceType= PlaceType.Empty;
    x: number = 0;
    y: number = 0;
    left: Place | null = null;
    right: Place | null = null;
    top: Place | null = null;
    bottom: Place | null = null;
}