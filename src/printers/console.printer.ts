import { Place } from "../models/place";
import { Chart } from "../models/chart";

export class ConsolePrinter {
    public print(building: Chart) {
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
