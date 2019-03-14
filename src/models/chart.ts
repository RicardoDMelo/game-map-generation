import { Place } from "./place";
import { PlaceType } from "../enums/place-type";
import { Coordinate } from "./coordinate";

export class Chart {
    public placesList: Place[];
    public places: any;
    public started = false;

    public firstHeightPosition: number = 0;
    public lastHeightPosition: number = 0;
    public firstWidthPosition: number = 0;
    public lastWidthPosition: number = 0;

    constructor() {
        this.placesList = [];
        this.places = {};
    }

    public getPlaceType(position: Coordinate): PlaceType {
        return this.places[position.x] != null && this.places[position.x][position.y] != null ?
            this.places[position.x][position.y].type : PlaceType.Empty;
    }

    public addPlace(position: Coordinate, type: PlaceType) {
        const x = position.x;
        const y = position.y;
        if (type !== PlaceType.Empty) this.started = true;

        this.initializePlace(x, y);

        if (y < this.firstHeightPosition) {
            this.firstHeightPosition = y;
        }
        if (y > this.lastHeightPosition) {
            this.lastHeightPosition = y;
        }
        if (x < this.firstWidthPosition) {
            this.firstWidthPosition = x;
        }
        if (x > this.lastWidthPosition) {
            this.lastWidthPosition = x;
        }

        const place = new Place();
        place.x = x;
        place.y = y;
        place.type = type;

        // Check left
        if (this.places[x - 1] != null && this.places[x - 1][y] != null) {
            place.left = this.places[x - 1][y];
            this.places[x - 1][y].right = place;
        }

        // Check Right
        if (this.places[x + 1] != null && this.places[x + 1][y] != null) {
            place.right = this.places[x + 1][y];
            this.places[x + 1][y].left = place;
        }

        // Check Top
        if (this.places[x] != null && this.places[x][y + 1] != null) {
            place.top = this.places[x][y + 1];
            this.places[x][y + 1].bottom = place;
        }

        // Check Bottom
        if (this.places[x] != null && this.places[x][y - 1] != null) {
            place.bottom = this.places[x][y - 1];
            this.places[x][y - 1].top = place;
        }

        this.placesList.push(place);
        this.places[x][y] = place;
    }

    private initializePlace(x: number, y: number) {
        this.places[x] = this.places[x] || {};
        this.places[x][y] = this.places[x][y] || new Place();
    }
}
