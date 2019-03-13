import { Place } from "./place";
import { PlaceType } from "../enums/place-type";
import { Coordinate } from "./coordinate";

export class Chart {
    public placesList: Place[];
    public places: any;

    public firstHeightPosition: number = 0;
    public lastHeightPosition: number = 0;
    public firstWidthPosition: number = 0;
    public lastWidthPosition: number = 0;

    constructor() {
        this.placesList = [];
        this.places = {};
    }

    public addPlace(x: number, y: number, type: PlaceType) {
        this.initializeNeighbors(x, y);

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
        if (this.places[x - 1][y] != null) {
            place.left = this.places[x - 1][y];
            this.places[x - 1][y].right = place;
        }

        // Check Right
        if (this.places[x + 1][y] != null) {
            place.right = this.places[x + 1][y];
            this.places[x + 1][y].left = place;
        }

        // Check Top
        if (this.places[x][y + 1] != null) {
            place.top = this.places[x][y + 1];
            this.places[x][y + 1].bottom = place;
        }

        // Check Bottom
        if (this.places[x][y - 1] != null) {
            place.bottom = this.places[x][y - 1];
            this.places[x][y - 1].top = place;
        }

        this.placesList.push(place);
        this.places[x][y] = place;
    }

    public isEnoughWidth(lastWidthPosition: number, startPosition: Coordinate, widthCheck: number): boolean {
        return this.getEmptyWidthFromPositionToEnd(lastWidthPosition, startPosition) > widthCheck;
    }

    public isEnoughHeight(lastHeightPosition: number, startPosition: Coordinate, heightCheck: number): boolean {
        return this.getEmptyHeightFromPositionToEnd(lastHeightPosition, startPosition) > heightCheck;
    }

    public getEmptyWidthFromPositionToEnd(lastWidthPosition: number, position: Coordinate): number {
        let quantity = 0;
        let currentPosition = position.x;
        let stillEmpty: boolean = true;
        while (currentPosition < lastWidthPosition && stillEmpty) {
            const currentPlace: Place = this.places[currentPosition - 1][position.y - 1];
            if (currentPlace != null && currentPlace.type !== PlaceType.Empty) {
                stillEmpty = false;
            } else {
                quantity++;
            }
            currentPosition++;
        }
        return quantity;
    }

    public getEmptyHeightFromPositionToEnd(lastWidthPosition: number, position: Coordinate): number {
        let quantity = 0;
        let currentPosition = position.y;
        let stillEmpty: boolean = true;
        while (currentPosition < lastWidthPosition && stillEmpty) {
            const currentPlace: Place = this.places[position.x - 1][currentPosition - 1];
            if (currentPlace != null && currentPlace.type !== PlaceType.Empty) {
                stillEmpty = false;
            } else {
                quantity++;
            }
            currentPosition++;
        }
        return quantity;
    }

    private initializeNeighbors(x: number, y: number) {
        this.places[x] = this.places[x] || new Place();
        this.places[x - 1] = this.places[x - 1] || new Place();
        this.places[x + 1] = this.places[x + 1] || new Place();

        this.places[x][y] = this.places[x][y] || new Place();

        this.places[x][y - 1] = this.places[x][y - 1] || new Place();
        this.places[x][y + 1] = this.places[x][y + 1] || new Place();
        this.places[x - 1][y] = this.places[x - 1][y] || new Place();
        this.places[x + 1][y] = this.places[x + 1][y] || new Place();
    }
}
