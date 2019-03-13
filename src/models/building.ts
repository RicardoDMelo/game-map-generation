import { FiniteChart } from "./finite-chart";
import { Dimensions } from "./dimensions";

export class Building extends FiniteChart {
    constructor(dimensions: Dimensions) {
        super(dimensions);
    }
}
