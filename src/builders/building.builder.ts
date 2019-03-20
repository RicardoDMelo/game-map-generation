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
import { Place } from "../models/place";
import * as utils from "./building-utils.builder";
import _ from "underscore";

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
        utils.showOnConsole(building);
        return building;
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
        this.removeDoubleWalls(building);
        this.createDoors(building);
    }

    private createDoors(building: Building) {

        for (const cornerCoor of building.corners) {
            const corner = building.getPlace(cornerCoor);
            const cornerX = _.min(building.corners, (cornerTmp) => {
                if (corner.y === cornerTmp.y)
                    return corner.x - cornerTmp.x;
                else
                    return null;
            });
            const cornerY = _.min(building.corners, (cornerTmp) => {
                if (corner.x === cornerTmp.x)
                    return corner.y - cornerTmp.y;
                else
                    return null;
            });
            const openingTypeX: number = getRandom(1, 5);
            this.createDoor(building, corner, cornerX, openingTypeX);
            const openingTypeY: number = getRandom(1, 5);
            this.createDoor(building, corner, cornerY, openingTypeY);
        }
    }

    private createDoor(building: Building, corner1: Coordinate, corner2: Coordinate, openingType: number) {
        if (openingType === 1) {
            // Door
            let door: Coordinate;
            if (corner1.x === corner2.x) {
                door = { x: corner1.x, y: getRandom(corner1.y + 1, corner2.y - 1) };
            } else {
                door = { x: getRandom(corner1.x + 1, corner2.x - 1), y: corner1.y };
            }
            building.changePlaceType(door, PlaceType.Door);
        } else if (openingType === 2) {
            // Big Door
            const getRandomSize = (maxValue: number) => {
                if (maxValue > 3) return getRandom(2, maxValue - 1);
                else return 2;
            };
            let delta: number;
            let randomSize: number;
            let randomStartPosition: number;
            if (corner1.x === corner2.x) {
                delta = corner2.y - corner1.y - 1;
                randomSize = getRandomSize(delta);
                if (corner2.y - randomSize < corner1.y + 1) {
                    // can't create a wall
                    openingType = 3;
                } else {
                    randomStartPosition = getRandom(corner1.y + 1, corner2.y - randomSize);
                    for (let y = randomStartPosition; y < randomStartPosition + randomSize; y++) {
                        building.changePlaceType({ x: corner1.x, y }, PlaceType.Door);
                    }
                }
            } else {
                delta = corner2.x - corner1.x - 1;
                randomSize = getRandomSize(delta);
                if (corner2.x - randomSize < corner1.x + 1) {
                    // can't create a wall
                    openingType = 3;
                } else {
                    randomStartPosition = getRandom(corner1.x, corner2.x - randomSize);
                    for (let x = randomStartPosition; x < randomStartPosition + randomSize; x++) {
                        building.changePlaceType({ x, y: corner1.y }, PlaceType.Door);
                    }
                }
            }
        } else if (openingType === 3) {
            // Remove Wall
            if (corner1.x === corner2.x) {
                for (let y = corner1.y + 1; y < corner2.y; y++) {
                    building.changePlaceType({ x: corner1.x, y }, PlaceType.Door);
                }
            } else {
                for (let x = corner1.x + 1; x < corner2.x; x++) {
                    building.changePlaceType({ x, y: corner1.y }, PlaceType.Door);
                }
            }
        }
    }

    private createRoom(building: Building, roomMaxDimension: Dimensions) {
        const roomSize: Dimensions = {
            width: getRandom(ROOM_WIDTH_MIN, roomMaxDimension.width),
            height: getRandom(ROOM_HEIGHT_MIN, roomMaxDimension.height)
        };

        let roomCreated = false;
        const randomDecreaseSize: boolean = getRandom(0, 1) === 1;

        while (!roomCreated && roomSize.width >= ROOM_WIDTH_MIN && roomSize.height >= ROOM_HEIGHT_MIN) {
            const roomPosition = this.getRoomPosition(building, roomSize);
            if (roomPosition != null) {
                building.plotRoom(roomPosition, roomSize);
                roomCreated = true;
            }
            if (!roomCreated) {
                this.decreaseRoomSize(roomSize, randomDecreaseSize);
            }
        }
        return !(roomSize.width >= ROOM_WIDTH_MIN && roomSize.height >= ROOM_HEIGHT_MIN);
    }

    private getRoomPosition(building: Building, roomSize: Dimensions): Coordinate | null {
        const roomPosition: Coordinate = {
            x: getRandom(1, building.maxWidth - roomSize.width - 1),
            y: getRandom(1, building.maxHeight - roomSize.height - 1)
        };
        const iteratePosition = building.iteratePosition();
        for (const coor of iteratePosition) {
            const newX = roomPosition.x + coor.x < building.maxWidth ?
                roomPosition.x + coor.x : (roomPosition.x - building.maxWidth + coor.x);

            const newY = roomPosition.y + coor.y < building.maxHeight ?
                roomPosition.y + coor.y : (roomPosition.y - building.maxHeight + coor.y);

            const corner = utils.isCorner(building, { x: newX, y: newY });
            const wall = building.getPlaceType({ x: newX, y: newY }) === PlaceType.Wall;

            let position: Coordinate | null = null;
            if (!building.started) {
                position = { x: newX, y: newY };
            } else if (wall && !corner) {
                position = this.getNextRoomSide(building, roomSize, { x: newX, y: newY });
            }

            if (position != null) {
                return position;
            }
        }

        return null;
    }

    private getNextRoomSide(building: Building, roomSize: Dimensions, currentPosition: Coordinate)
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

        if (testNewPosition != null && utils.hasEnoughSpace(building, roomSize, testNewPosition)) {
            return testNewPosition;
        }

        return null;
    }

    private removeDoubleWalls(building: Building) {
        const removedPlaces: any = {};

        const iteratePosition = building.iteratePlaces();
        for (const place of iteratePosition) {
            if (place != null && place.type === PlaceType.Wall) {
                const isPlaceRemoved = removedPlaces[place.x] != null && removedPlaces[place.x][place.y];
                const removeY: boolean = utils.verifyIfDoubleWallX(place, isPlaceRemoved);
                const removeX: boolean = utils.verifyIfDoubleWallY(place, isPlaceRemoved);
                if (removeY || removeX) {
                    if (removedPlaces[place.x] == null) removedPlaces[place.x] = {};
                    removedPlaces[place.x][place.y] = true;
                    building.changePlaceType(place.coordinate, PlaceType.Floor);
                }
            }
        }
    }

    private decreaseRoomSize(roomSize: Dimensions, decreaseWidthFirst: boolean): Dimensions {
        if (roomSize.width === ROOM_WIDTH_MIN && roomSize.height === ROOM_HEIGHT_MIN) {
            roomSize.height--;
            roomSize.width--;
            return roomSize;
        }
        if (decreaseWidthFirst) {
            if (roomSize.width > ROOM_WIDTH_MIN) {
                roomSize.width--;
            } else {
                roomSize.height--;
            }
        } else {
            if (roomSize.height > ROOM_HEIGHT_MIN) {
                roomSize.height--;
            } else {
                roomSize.width--;
            }
        }
        return roomSize;
    }
}
