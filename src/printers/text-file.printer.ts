import { Place } from "../models/place";
import { Chart } from "../models/chart";
import fs from "fs";
import { IPrinter } from "./interface.printer";

export class TextFilePrinter implements IPrinter {
    public print(building: Chart): void {
        let mapPrint = "";
        for (let x = building.firstWidthPosition; x <= building.lastWidthPosition; x++) {
            for (let y = building.firstHeightPosition; y <= building.lastHeightPosition; y++) {
                const currentPlace: Place = building.places[x][y];
                if (currentPlace != null) {
                    mapPrint += currentPlace.type.toString();
                }
            }
            mapPrint += "\n";
        }
        const dir = `${__dirname}/prints`;
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
        fs.writeFileSync(`${dir}/test`, mapPrint);
        console.log("Printed to file");
    }
}
