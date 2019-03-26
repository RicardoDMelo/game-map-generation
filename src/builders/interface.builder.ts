import { Chart } from "../models/charts/chart";

export interface IBuilder {
    generateMap(): Chart;
}
