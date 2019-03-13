import { Place } from "../models/place";
import { Chart } from "../models/chart";
import { IPrinter } from "./interface.printer";

export class ConsolePrinter implements IPrinter {
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
        console.log(mapPrint);
    }
}
