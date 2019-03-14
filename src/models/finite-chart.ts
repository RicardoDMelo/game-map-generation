import { Chart } from "./chart";
import { Dimensions } from "./dimensions";
import { PlaceType } from "../enums/place-type";
import { Coordinate } from "./coordinate";
import { Place } from "./place";

export class FiniteChart extends Chart {

    public get maxHeight(): number {
        return this.dimensions.height;
    }
    public get maxWidth(): number {
        return this.dimensions.width;
    }
    public dimensions: Dimensions;

    constructor(dimensions: Dimensions) {
        super();
        this.initializeEmpty(dimensions);
        this.dimensions = dimensions;
    }

    public isEnoughWidth(startPosition: Coordinate, widthCheck: number): boolean {
        return this.getEmptyWidthFromPositionToEnd(startPosition) > widthCheck;
    }

    public isEnoughHeight(startPosition: Coordinate, heightCheck: number): boolean {
        return this.getEmptyHeightFromPositionToEnd(startPosition) > heightCheck;
    }

    public getEmptyWidthFromPositionToEnd(position: Coordinate): number {
        let quantity = 0;
        let currentPosition = position.x;
        let stillEmpty: boolean = true;
        while (currentPosition < this.maxWidth && stillEmpty && currentPosition > 0 && position.y > 0) {
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

    public getEmptyHeightFromPositionToEnd(position: Coordinate): number {
        let quantity = 0;
        let currentPosition = position.y;
        let stillEmpty: boolean = true;
        while (currentPosition < this.maxHeight && stillEmpty && currentPosition > 0 && position.x > 0) {
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

    private initializeEmpty(dimensions: Dimensions) {
        for (let x = 0; x <= dimensions.width; x++) {
            for (let y = 0; y <= dimensions.height; y++) {
                this.addPlace({x, y}, PlaceType.Empty);
            }
        }
    }
}
