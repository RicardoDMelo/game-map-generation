import { Chart } from "../models/chart";
import { Place } from "../models/place";

export class TextPrinter {

    public getChartString(chart: Chart): string {
        let mapPrint = "";

        let spaces = "";
        for (const quantity of chart.lastHeightPosition.toString()) {
            spaces += " ";
        }

        for (let y = chart.lastHeightPosition; y >= chart.firstHeightPosition; y--) {
            mapPrint += " " + y + spaces.slice(0, -(y.toString().length));
            for (let x = chart.firstWidthPosition; x <= chart.lastWidthPosition; x++) {
                const currentPlace: Place = chart.getPlace({ x, y });
                if (currentPlace != null) {
                    mapPrint += currentPlace.type.toString();
                }
            }
            mapPrint += "\n";
        }
        mapPrint += "   ";
        for (let x = chart.firstWidthPosition; x <= chart.lastWidthPosition; x++) {
            mapPrint += " " + x + " ";
        }
        mapPrint += "\n";
        return mapPrint;
    }
}
