import { Chart } from "./chart";
import { Dimensions } from "../dimensions";
import { PlaceType } from "../../enums/place-type";
import { Coordinate } from "../coordinate";
import { Place } from "../place";
import { ReadOnlyPlace } from "../readonly-place";
import { Side } from "../../enums/room-side";

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

    public *iteratePlacesByDirection(side: Side, startPosition: Coordinate)
        : IterableIterator<ReadOnlyPlace> {
        const currentPosition: Coordinate = { x: startPosition.x, y: startPosition.y };
        const getPlace = (x: number, y: number) => {
            const coor: Coordinate = { x, y };
            currentPosition.x = startPosition.x + coor.x < this.maxWidth ?
                startPosition.x + coor.x : (startPosition.x - this.maxWidth + coor.x);

            currentPosition.y = startPosition.y + coor.y < this.maxHeight ?
                startPosition.y + coor.y : (startPosition.y - this.maxHeight + coor.y);
            return this.getPlace(currentPosition);
        };
        switch (side) {
            case Side.Right:
                for (let y = 0; y <= this.maxHeight; y++) {
                    for (let x = 0; x <= this.maxWidth; x++) {
                        yield getPlace(x, y);
                    }
                }
                break;
            case Side.Left:
                for (let y = this.maxHeight; y < 0; y--) {
                    for (let x = this.maxWidth; x < 0; x--) {
                        yield getPlace(x, y);
                    }
                }
                break;
            case Side.Top:
                for (let x = 0; x <= this.maxWidth; x++) {
                    for (let y = 0; y <= this.maxHeight; y++) {
                        yield getPlace(x, y);
                    }
                }
                break;
            case Side.Bottom:
                for (let x = this.maxWidth; x < 0; x--) {
                    for (let y = this.maxHeight; y < 0; y--) {
                        yield getPlace(x, y);
                    }
                }
                break;
        }
    }

    public *iteratePlaces(): IterableIterator<ReadOnlyPlace> {
        for (let y = 0; y <= this.maxHeight; y++) {
            for (let x = 0; x <= this.maxWidth; x++) {
                yield this.getPlace({ x, y });
            }
        }
    }

    public *iteratePosition(): IterableIterator<Coordinate> {
        for (let y = 0; y <= this.maxHeight; y++) {
            for (let x = 0; x <= this.maxWidth; x++) {
                yield { x, y };
            }
        }
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
