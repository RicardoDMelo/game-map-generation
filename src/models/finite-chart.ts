import { Chart } from "./chart";
import { Dimensions } from "./dimensions";
import { PlaceType } from "../enums/place-type";

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

    private initializeEmpty(dimensions: Dimensions) {
        for (let x = 0; x <= dimensions.width; x++) {
            for (let y = 0; y <= dimensions.height; y++) {
                this.addPlace(x, y, PlaceType.Empty);
            }
        }
    }
}
