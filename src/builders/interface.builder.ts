import { Chart } from "../models/chart";

export interface IBuilder {
    generateMap(): Chart;
}