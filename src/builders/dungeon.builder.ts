import { Chart } from "../models/charts/chart";
import { IBuilder } from "./interface.builder";
import { Dungeon } from "../models/charts/dungeon";
import { Dimensions } from "../models/dimensions";
import {
    BUILDING_WIDTH_MAX,
    BUILDING_HEIGHT_MAX,
    ROOM_COUNT
} from "../helpers/consts";
import { TextFilePrinter } from "../printers/text-file.printer";
import { showOnConsole } from "../helpers/chart.utils";
import { Coordinate } from "../models/coordinate";
import { getRandom } from "../helpers/random-seed";

export class DungeonBuilder implements IBuilder {
    public generateMap(): Chart {
        const dungeonDimensions: Dimensions = {
            // width: getRandom(BUILDING_WIDTH_MAX / 2, BUILDING_WIDTH_MAX),
            // height: getRandom(BUILDING_HEIGHT_MAX / 2, BUILDING_HEIGHT_MAX)
            width: getRandom(BUILDING_WIDTH_MAX, BUILDING_WIDTH_MAX),
            height: getRandom(BUILDING_HEIGHT_MAX, BUILDING_HEIGHT_MAX)
        };
        const roomCount = getRandom(ROOM_COUNT / 2, ROOM_COUNT);
        const dungeon = new Dungeon(dungeonDimensions);

        this.fillDungeon(dungeon, roomCount);
        // const printer = new TextFilePrinter();
        // printer.print(dungeon);
        // showOnConsole(dungeon);
        return dungeon;
    }

    private fillDungeon(dungeon: Dungeon, roomCount: number) {
        const centers = this.defineCenters(dungeon, roomCount);
        console.log(centers);
    }

    private defineCenters(dungeon: Dungeon, roomCount: number): Coordinate[] {
        const centers: Coordinate[] = [];

        const distanceDiagonal = Math.sqrt(dungeon.maxWidth ** 2 + dungeon.maxHeight ** 2) / roomCount;
        const distanceWidth = dungeon.maxWidth / roomCount + 2;
        const distanceHeight = dungeon.maxHeight / roomCount + 2;

        let lastX = getRandom(0, dungeon.maxWidth);
        let lastY = getRandom(0, dungeon.maxHeight);

        for (let i = 0; i < roomCount; i++) {
            let newX = lastX + distanceWidth / getRandom(1, 3);
            let newY = lastY + distanceHeight / getRandom(1, 3);
            if (newX < dungeon.maxWidth) {
                newY = this.pitagorasCalc(distanceDiagonal, (lastX - newX)) + lastY;
                if (newY > dungeon.maxHeight) {
                    newY = this.pitagorasCalc(distanceDiagonal, (lastX - newX)) - lastY;
                }
            } else {
                newX = this.pitagorasCalc(distanceDiagonal, (lastY - newY)) + lastX;
                if (newX > dungeon.maxWidth) {
                    newX = this.pitagorasCalc(distanceDiagonal, (lastY - newY)) - lastX;
                }
            }
            centers.push({ x: newX, y: newY });
            lastX = newX;
            lastY = newY;
        }
        return centers;
    }

    private pitagorasCalc(diagonal: number, x: number, ) {
        return Math.sqrt((diagonal ** 2) - (x ** 2));
    }
}
