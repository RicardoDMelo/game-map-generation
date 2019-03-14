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
import { RoomSide } from "../enums/room-side";

export class BuildingBuilder implements IBuilder {
    public generateMap = (): Chart => {
        const buildingDimensions: Dimensions = {
            width: getRandom(BUILDING_WIDTH_MAX, BUILDING_WIDTH_MAX),
            height: getRandom(BUILDING_HEIGHT_MAX, BUILDING_HEIGHT_MAX)
            // width: getRandom(BUILDING_WIDTH_MAX / 2, BUILDING_WIDTH_MAX),
            // height: getRandom(BUILDING_HEIGHT_MAX / 2, BUILDING_HEIGHT_MAX)
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
        const roomSize: Dimensions = {
            width: getRandom(ROOM_WIDTH_MIN, roomMaxDimension.width),
            height: getRandom(ROOM_HEIGHT_MIN, roomMaxDimension.height)
        };

        let roomCreated = false;

        while (!roomCreated && roomSize.width >= ROOM_WIDTH_MIN && roomSize.height >= ROOM_HEIGHT_MIN) {
            const roomPosition = this.getRoomPosition(building, roomSize);
            if (roomPosition != null) {
                building.plotRoom(roomPosition, roomSize);
                roomCreated = true;
            }
            if (!roomCreated) {
                roomSize.width--;
                roomSize.height--;
            }
        }
        return !(roomSize.width >= ROOM_WIDTH_MIN && roomSize.height >= ROOM_HEIGHT_MIN);
    }

    private getRoomPosition(building: Building, roomSize: Dimensions): Coordinate | null {
        const roomPosition: Coordinate = {
            x: getRandom(0, building.maxWidth),
            y: getRandom(0, building.maxHeight)
        };

        for (let x = 0; x <= building.maxWidth; x++) {
            const newX = roomPosition.x + x <= building.maxWidth ?
                roomPosition.x + x : roomPosition.x - building.maxWidth + x - 1;
            for (let y = 0; y <= building.maxHeight; y++) {
                const newY = roomPosition.y + y <= building.maxHeight ?
                    roomPosition.y + y : roomPosition.y - building.maxHeight + y - 1;
                if (!building.started || building.getPlaceType({ x: newX, y: newY }) === PlaceType.Wall) {
                    const position = this.getNextRoomPosition(building, roomSize, { x: newX, y: newY });
                    if (position != null)
                        return position;
                }
            }

        }
        return null;
    }

    private checkSpace(building: Building, roomSize: Dimensions, position: Coordinate): boolean {
        return building.getPlaceType(position) === PlaceType.Empty &&
            building.isEnoughWidth(position, roomSize.width) &&
            building.isEnoughHeight(position, roomSize.height);
    }

    private getNextRoomPosition(building: Building, roomSize: Dimensions, currentPosition: Coordinate)
        : Coordinate | null {
        let position = getRandom(1, 4);
        let counterPosition = 0;
        let testNewPosition: Coordinate;

        while (counterPosition < 4) {
            if (counterPosition < 4 && position === RoomSide.Top) {
                // Top
                testNewPosition = { x: currentPosition.x, y: currentPosition.y + roomSize.height };
                if (this.checkSpace(building, roomSize, testNewPosition)) {
                    return testNewPosition;
                } else {
                    position++;
                    counterPosition++;
                }
            }
            if (counterPosition < 4 && position === RoomSide.Right) {
                // Right
                testNewPosition = { x: currentPosition.x + roomSize.width, y: currentPosition.y };
                if (this.checkSpace(building, roomSize, testNewPosition)) {
                    return testNewPosition;
                } else {
                    position++;
                    counterPosition++;
                }
            }
            if (counterPosition < 4 && position === RoomSide.Bottom) {
                // Bottom
                testNewPosition = { x: currentPosition.x, y: currentPosition.y - roomSize.height };
                if (this.checkSpace(building, roomSize, testNewPosition)) {
                    return testNewPosition;
                } else {
                    position++;
                    counterPosition++;
                }
            }
            if (counterPosition < 4 && position === RoomSide.Left) {
                // Left
                testNewPosition = { x: currentPosition.x - roomSize.width, y: currentPosition.y };
                if (this.checkSpace(building, roomSize, testNewPosition)) {
                    return testNewPosition;
                } else {
                    position = 1;
                    counterPosition++;
                }
            }
        }
        return null;
    }
}
