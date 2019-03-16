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
import { ConsolePrinter } from "../printers/console.printer";
import { Place } from "../models/place";

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
        const building = new Building(buildingDimensions);
        this.fillBuilding(building, roomDimensions);
        const printer = new TextFilePrinter();
        printer.print(building);
        this.showOnConsole(building);
        return building;
    }

    public showOnConsole(building: Building) {
        const printer = new ConsolePrinter();
        printer.print(building);
    }

    public generateCustomMap = (buildingDimensions: Dimensions, roomMaxDimension: Dimensions): Chart => {
        const building = new Building(buildingDimensions);
        this.fillBuilding(building, roomMaxDimension);
        const printer = new TextFilePrinter();
        printer.print(building);
        return building;
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

    private isCorner(building: Building, position: Coordinate): boolean {
        const placeType = building.getPlaceType(position);
        if (placeType === PlaceType.Wall) {
            const leftPosition: Coordinate = { x: position.x - 1, y: position.y };
            const rightPosition: Coordinate = { x: position.x + 1, y: position.y };
            const topPosition: Coordinate = { x: position.x, y: position.y + 1 };
            const bottomPosition: Coordinate = { x: position.x - 1, y: position.y - 1 };

            const isLeft = building.getPlaceType(leftPosition) === PlaceType.Wall;
            const isRight = building.getPlaceType(rightPosition) === PlaceType.Wall;
            const isTop = building.getPlaceType(topPosition) === PlaceType.Wall;
            const isBottom = building.getPlaceType(bottomPosition) === PlaceType.Wall;

            return (isLeft && isTop) || (isLeft && isBottom) || (isRight && isTop) || (isRight && isBottom);
        }
        return false;
    }

    private getRoomPosition(building: Building, roomSize: Dimensions): Coordinate | null {
        const roomPosition: Coordinate = {
            x: getRandom(1, building.maxWidth - roomSize.width - 1),
            y: getRandom(1, building.maxHeight - roomSize.height - 1)
        };

        for (let x = 0; x <= building.maxWidth; x++) {
            const newX = roomPosition.x + x < building.maxWidth ?
                roomPosition.x + x : (roomPosition.x - building.maxWidth + x);

            for (let y = 0; y <= building.maxHeight; y++) {
                const newY = roomPosition.y + y < building.maxHeight ?
                    roomPosition.y + y : (roomPosition.y - building.maxHeight + y);

                const isCorner = this.isCorner(building, { x: newX, y: newY });
                const isWall = building.getPlaceType({ x: newX, y: newY }) === PlaceType.Wall;

                let position: Coordinate | null = null;
                if (!building.started) {
                    position = { x: newX, y: newY };
                } else if (isWall && !isCorner) {
                    position = this.getNextRoomPosition(building, roomSize, { x: newX, y: newY });
                }

                if (position != null) {
                    return position;
                }

            }
        }

        return null;
    }

    private getNextRoomPosition(building: Building, roomSize: Dimensions, currentPosition: Coordinate)
        : Coordinate | null {
        const currentPlace = building.getPlace(currentPosition);
        if (currentPlace.type !== PlaceType.Wall) {
            throw Error("Needs to be a wall");
        }

        let testNewPosition: Coordinate | null = null;
        if (currentPlace.right != null && (currentPlace.right as Place).type === PlaceType.Empty) {
            testNewPosition = { x: currentPosition.x + 1, y: currentPosition.y };
        }
        if (currentPlace.top != null && (currentPlace.top as Place).type === PlaceType.Empty) {
            testNewPosition = { x: currentPosition.x, y: currentPosition.y + 1 };
        }
        if (currentPlace.left != null && (currentPlace.left as Place).type === PlaceType.Empty) {
            testNewPosition = { x: currentPosition.x - roomSize.width, y: currentPosition.y };
        }
        if (currentPlace.bottom != null && (currentPlace.bottom as Place).type === PlaceType.Empty) {
            testNewPosition = { x: currentPosition.x, y: currentPosition.y - roomSize.height };
        }

        if (testNewPosition != null && this.checkSpace(building, roomSize, testNewPosition)) {
            return testNewPosition;
        }

        return null;
    }

    private checkSpace(building: Building, roomSize: Dimensions, position: Coordinate): boolean {
        const isEmpty = building.getPlaceType(position) === PlaceType.Empty;
        const isEnoughWidth = building.isEnoughWidth(position, roomSize.width);
        const isEnoughHeight = building.isEnoughHeight(position, roomSize.height);

        return isEmpty && isEnoughWidth && isEnoughHeight;
    }
}
