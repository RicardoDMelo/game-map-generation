import { Chart } from "../models/charts/chart";
import { IBuilder } from "./interface.builder";
import { Dungeon } from "../models/charts/dungeon";
import { Dimensions } from "../models/dimensions";
import {
    BUILDING_WIDTH_MAX,
    BUILDING_HEIGHT_MAX,
    ROOM_HEIGHT_MAX,
    ROOM_WIDTH_MAX
} from "../helpers/consts";
import * as utils from "../helpers/utils";
import { TextFilePrinter } from "../printers/text-file.printer";
import { showOnConsole } from "../helpers/chart.utils";
import { Coordinate } from "../models/coordinate";

export class DungeonBuilder implements IBuilder {
    public generateMap(): Chart {
        const dungeonDimensions: Dimensions = {
            // width: getRandom(BUILDING_WIDTH_MAX / 2, BUILDING_WIDTH_MAX),
            // height: getRandom(BUILDING_HEIGHT_MAX / 2, BUILDING_HEIGHT_MAX)
            width: utils.getRandom(BUILDING_WIDTH_MAX, BUILDING_WIDTH_MAX),
            height: utils.getRandom(BUILDING_HEIGHT_MAX, BUILDING_HEIGHT_MAX)
        };
        const dungeon = new Dungeon(dungeonDimensions);
        this.fillDungeon(dungeon);
        const printer = new TextFilePrinter();
        printer.print(dungeon);
        showOnConsole(dungeon);
        return dungeon;
    }
    
    private fillDungeon(dungeon: Dungeon) {

    }

    private defineCenters(dungeon: Dungeon, roomCount: number): Coordinate[] {
        const centers: Coordinate[] = [];
        const distanceWidth = dungeon.maxWidth / roomCount + 2;
        const distanceHeight = dungeon.maxHeight / roomCount + 2;
        let lastX = utils.getRandom(0, dungeon.maxWidth);
        let lastY = utils.getRandom(0, dungeon.maxHeight);


        for (let i = 0; i < roomCount; i++) {
            const position: Coordinate = { x: lastX, y: lastY };

        }
        return centers;
    }
}
