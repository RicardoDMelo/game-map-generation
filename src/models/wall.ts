import { Coordinate } from "./coordinate";

export class Wall {
    public corner1: Coordinate;
    public corner2: Coordinate;
    public outer: boolean = false;
    public looseEnd: boolean = false;

    constructor(corner1: Coordinate, corner2: Coordinate) {
        this.corner1 = corner1;
        this.corner2 = corner2;
    }
}
