import { Place } from "./place";
import { PlaceType } from "../enums/place-type";

export class Dungeon {
    public places: Place[];
    public placesDictionary: any;

    public minHeight: number = 0;
    public maxHeight: number = 0;
    public minWidth: number = 0;
    public maxWidth: number = 0;

    constructor() {
        this.places = [];
        this.placesDictionary = {};
    }

    public addPlace(x: number, y: number, type: PlaceType) {
        this.initializeNeighbors(x, y);

        if (y < this.minHeight) {
            this.minHeight = y;
        }
        if (y > this.maxHeight) {
            this.maxHeight = y;
        }
        if (x < this.minWidth) {
            this.minWidth = x;
        }
        if (x > this.maxWidth) {
            this.maxWidth = x;
        }

        const place = new Place();
        place.x = x;
        place.y = y;
        place.type = type;

        // Check left
        if (this.placesDictionary[x - 1][y] != null) {
            place.left = this.placesDictionary[x - 1][y];
            this.placesDictionary[x - 1][y].right = place;
        }

        // Check Right
        if (this.placesDictionary[x + 1][y] != null) {
            place.right = this.placesDictionary[x + 1][y];
            this.placesDictionary[x + 1][y].left = place;
        }

        // Check Top
        if (this.placesDictionary[x][y + 1] != null) {
            place.top = this.placesDictionary[x][y + 1];
            this.placesDictionary[x][y + 1].bottom = place;
        }

        // Check Bottom
        if (this.placesDictionary[x][y - 1] != null) {
            place.bottom = this.placesDictionary[x][y - 1];
            this.placesDictionary[x][y - 1].top = place;
        }

        this.places.push(place);
        this.placesDictionary[x][y] = place;
    }

    private initializeNeighbors(x: number, y: number) {
        this.placesDictionary[x] = this.placesDictionary[x] || new Place();
        this.placesDictionary[x - 1] = this.placesDictionary[x - 1] || new Place();
        this.placesDictionary[x + 1] = this.placesDictionary[x + 1] || new Place();

        this.placesDictionary[x][y] = this.placesDictionary[x][y] || new Place();

        this.placesDictionary[x][y - 1] = this.placesDictionary[x][y - 1] || new Place();
        this.placesDictionary[x][y + 1] = this.placesDictionary[x][y + 1] || new Place();
        this.placesDictionary[x - 1][y] = this.placesDictionary[x - 1][y] || new Place();
        this.placesDictionary[x + 1][y] = this.placesDictionary[x + 1][y] || new Place();
    }
}
