import { FiniteChart } from "./finite-chart";
import { Dimensions } from "./dimensions";
import { PlaceType } from "../enums/place-type";
import { Coordinate } from "./coordinate";

export class Building extends FiniteChart {
    constructor(dimensions: Dimensions) {
        super(dimensions);
    }

    public plotRoom(roomPosition: Coordinate, roomSize: Dimensions) {
        const left = roomPosition.x;
        const right = (roomSize.width + roomPosition.x) - 1;
        const bottom = roomPosition.y;
        const top = (roomSize.height + roomPosition.y) - 1;
        for (let x = left; x <= right; x++) {
            for (let y = bottom; y <= top; y++) {
                this.addPlace({ x, y }, PlaceType.Floor);
                if (x === left || x === right || y === top || y === bottom) {
                    // If is a boundary
                    this.plotWall({ x, y }, left, right, top, bottom);
                }
            }
        }
    }

    private plotWall(floor: Coordinate, left: number, right: number, top: number, bottom: number) {
        const x = floor.x;
        const y = floor.y;

        if (x === left || x === right) {
            this.addPlace({
                x: x === right ? x + 1 : x - 1,
                y
            }, PlaceType.Wall);
        }
        if (y === top || y === bottom) {
            this.addPlace({
                x,
                y: y === top ? y + 1 : y - 1
            }, PlaceType.Wall);
        }
    }
}
