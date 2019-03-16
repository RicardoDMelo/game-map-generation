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
        return this.getEmptyWidthFromPositionToEnd(startPosition) >= widthCheck;
    }

    public isEnoughHeight(startPosition: Coordinate, heightCheck: number): boolean {
        return this.getEmptyHeightFromPositionToEnd(startPosition) >= heightCheck;
    }

    public getEmptyWidthFromPositionToEnd(position: Coordinate): number {
        let quantity = 0;

        if (position.x > 0 && position.y > 0) {
            for (let currentPosition = position.x; currentPosition < this.maxWidth - 1; currentPosition++) {
                const currentPlace: Place = this.getPlace({ x: currentPosition, y: position.y });
                if (currentPlace != null && currentPlace.type === PlaceType.Empty) {
                    quantity++;
                } else {
                    break;
                }
            }
        }
        return quantity;
    }

    public getEmptyHeightFromPositionToEnd(position: Coordinate): number {
        let quantity = 0;

        if (position.x > 0 && position.y > 0) {
            for (let currentPosition = position.y; currentPosition < this.maxHeight - 1; currentPosition++) {
                const currentPlace: Place = this.getPlace({ x: position.x, y: currentPosition });
                if (currentPlace != null && currentPlace.type === PlaceType.Empty) {
                    quantity++;
                } else {
                    break;
                }
            }
        }
        return quantity;
    }

    private initializeEmpty(dimensions: Dimensions) {
        for (let x = 0; x < dimensions.width; x++) {
            for (let y = 0; y < dimensions.height; y++) {
                this.addPlace({ x, y }, PlaceType.Empty);
            }
        }
    }
}
