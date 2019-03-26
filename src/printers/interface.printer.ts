import { Chart } from "../models/charts/chart";

export interface IPrinter {
    print(building: Chart): void;
}
