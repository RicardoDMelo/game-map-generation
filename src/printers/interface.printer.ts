import { Chart } from "../models/chart";

export interface IPrinter {
    print(building: Chart): void;
}
