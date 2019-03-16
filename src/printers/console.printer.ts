import { Chart } from "../models/chart";
import { IPrinter } from "./interface.printer";
import { TextPrinter } from "./text.printer";

export class ConsolePrinter extends TextPrinter implements IPrinter  {
    public print(building: Chart): void {
        console.log(this.getChartString(building));
    }
}
