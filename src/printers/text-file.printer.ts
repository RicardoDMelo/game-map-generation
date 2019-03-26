import { Chart } from "../models/charts/chart";
import fs from "fs";
import { IPrinter } from "./interface.printer";
import { TextPrinter } from "./text.printer";

export class TextFilePrinter extends TextPrinter implements IPrinter {
    public print(building: Chart): void {
        const dir = `${__dirname}/prints`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(`${dir}/map-${new Date().getTime()}.txt`, this.getChartString(building));
        console.log("Printed to file");
    }
}
