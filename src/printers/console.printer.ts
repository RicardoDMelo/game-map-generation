import { IPrinter } from "./interface.printer";
import { TextPrinter } from "./text.printer";
import { Chart } from "../models/charts/chart";

export class ConsolePrinter extends TextPrinter implements IPrinter  {
    public print(building: Chart): void {
        console.log(this.getChartString(building));
    }
}
