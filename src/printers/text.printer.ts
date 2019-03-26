
import { Chart } from "../models/charts/chart";
import { Place } from "../models/place";

export class TextPrinter {

    public getChartString(chart: Chart): string {
        let mapPrint = "";

        let spacesHeight = "";
        for (const quantity of chart.lastHeightPosition.toString()) {
            spacesHeight += " ";
        }
        let spacesWidth = "";
        for (const quantity of chart.lastWidthPosition.toString()) {
            spacesWidth += " ";
        }

        for (let y = chart.lastHeightPosition; y >= chart.firstHeightPosition; y--) {
            mapPrint += " " + y + spacesHeight.slice(0, -(y.toString().length));
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
            mapPrint += " " + x + spacesWidth.slice(0, -(x.toString().length));
        }
        mapPrint += "\n";
        return mapPrint;
    }
}
