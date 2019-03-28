import { FiniteChart } from "./finite-chart";
import { Dimensions } from "../dimensions";
import { Coordinate } from "../coordinate";
import { Wall } from "../wall";
import _ from "underscore";
import { isOuterWall, isLooseEnd } from "../../helpers/chart.utils";
import { PlaceType } from "../enums/place-type";

export class Building extends FiniteChart {
    private _walls: Wall[] = [];
    public get walls(): Wall[] {
        return this._walls;
    }
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

    public cleanWalls() {
        this._walls = [];
    }

    public addWall(wall: Wall) {
        const exists = _.any(this._walls, (el) => el.corner1.x === wall.corner1.x && el.corner2.x === wall.corner2.x &&
            el.corner1.y === wall.corner1.y && el.corner2.y === wall.corner2.y);
        if (!exists) {
            wall.outer = isOuterWall(this, wall);
            wall.looseEnd = isLooseEnd(this, wall);
            this._walls.push(wall);
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
        if ((y === top || y === bottom) && (x === left || x === right)) {
            const corner = {
                x: x === right ? x + 1 : x === left ? x - 1 : x,
                y: y === top ? y + 1 : y === bottom ? y - 1 : y
            };
            this.addPlace(corner, PlaceType.Wall);
        }
    }
}
