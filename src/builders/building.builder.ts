import { Building } from "../models/building";
import { getRandom } from "../helpers/utils";
import {
    BUILDING_WIDTH_MAX,
    BUILDING_HEIGHT_MAX,
    ROOM_HEIGHT_MAX,
    ROOM_WIDTH_MAX,
    ROOM_WIDTH_MIN,
    ROOM_HEIGHT_MIN
} from "../helpers/consts";
import { IBuilder } from "./interface.builder";
import { Chart } from "../models/chart";
import { Dimensions } from "../models/dimensions";
import { Coordinate } from "../models/coordinate";
import { PlaceType } from "../enums/place-type";
import { TextFilePrinter } from "../printers/text-file.printer";

export class BuildingBuilder implements IBuilder {
    public generateMap = (): Chart => {
        const buildingDimensions: Dimensions = {
            width: getRandom(BUILDING_WIDTH_MAX / 2, BUILDING_WIDTH_MAX),
            height: getRandom(BUILDING_HEIGHT_MAX / 2, BUILDING_HEIGHT_MAX)
        };
        const roomDimensions: Dimensions = {
            width: ROOM_WIDTH_MAX,
            height: ROOM_HEIGHT_MAX
        };
        const newBuilding = new Building(buildingDimensions);
        this.fillBuilding(newBuilding, roomDimensions);
        const printer = new TextFilePrinter();
        printer.print(newBuilding);
        return newBuilding;
    }

    public generateCustomMap = (buildingDimensions: Dimensions, roomMaxDimension: Dimensions): Chart => {
        const newBuilding = new Building(buildingDimensions);
        this.fillBuilding(newBuilding, roomMaxDimension);
        const printer = new TextFilePrinter();
        printer.print(newBuilding);
        return newBuilding;
    }

    private fillBuilding(building: Building, roomMaxDimension: Dimensions) {
        let filled = false;
        do {
            filled = this.createRoom(building, roomMaxDimension);
        } while (!filled);
    }

    private createRoom(building: Building, roomMaxDimension: Dimensions) {
        const startPosition: Coordinate = {
            x: getRandom(0, building.maxWidth),
            y: getRandom(0, building.maxHeight)
        };
        const roomSize: Dimensions = {
            width: getRandom(ROOM_WIDTH_MIN, roomMaxDimension.width),
            height: getRandom(ROOM_HEIGHT_MIN, roomMaxDimension.height)
        };

        let counterHeight = 0;
        let counterWidth = 0;
        let roomCreated = false;
        while (!roomCreated && roomSize.width > ROOM_WIDTH_MIN && roomSize.height > ROOM_HEIGHT_MIN) {
            while (!roomCreated && (counterHeight < building.maxHeight || counterWidth < building.maxWidth)) {
                if (building.isEnoughWidth(building.maxWidth, startPosition, roomSize.width)) {
                    if (building.isEnoughHeight(building.maxHeight, startPosition, roomSize.height)) {
                        for (let x = startPosition.x; x < (roomSize.width + startPosition.x); x++) {
                            for (let y = startPosition.y; y < (roomSize.height + startPosition.y); y++) {
                                building.addPlace(x, y, PlaceType.Floor);
                            }
                        }
                        roomCreated = true;
                    } else {
                        if (startPosition.y === 0) {
                            startPosition.y = building.maxHeight - 1;
                        } else {
                            startPosition.y = startPosition.y - 1;
                        }
                        counterWidth++;
                    }
                } else {
                    if (startPosition.x === 0) {
                        startPosition.x = building.maxWidth - 1;
                    } else {
                        startPosition.x = startPosition.x - 1;
                    }
                    counterHeight++;
                }
            }
            if (!roomCreated) {
                roomSize.width--;
                roomSize.height--;
            }
        }
        return !(roomSize.width > ROOM_WIDTH_MIN && roomSize.height > ROOM_HEIGHT_MIN);
    }
}
