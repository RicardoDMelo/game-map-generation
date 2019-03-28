import { Building } from "../models/charts/building";
import {
    BUILDING_WIDTH_MAX,
    BUILDING_HEIGHT_MAX,
    ROOM_HEIGHT_MAX,
    ROOM_WIDTH_MAX,
    ROOM_WIDTH_MIN,
    ROOM_HEIGHT_MIN
} from "../helpers/consts";
import { IBuilder } from "./interface.builder";
import { Chart } from "../models/charts/chart";
import { Dimensions } from "../models/dimensions";
import { Coordinate } from "../models/coordinate";
import { TextFilePrinter } from "../printers/text-file.printer";
import { Place } from "../models/place";
import * as utils from "../helpers/chart.utils";
import _ from "underscore";
import { Wall } from "../models/wall";
import { ReadOnlyPlace } from "../models/readonly-place";
import { getRandom } from "../helpers/random-seed";
import { Side } from "../models/enums/room-side";
import { PlaceType } from "../models/enums/place-type";

export class BuildingBuilder implements IBuilder {
    public generateMap = (): Chart => {
        const buildingDimensions: Dimensions = {
            // width: getRandom(BUILDING_WIDTH_MAX / 2, BUILDING_WIDTH_MAX),
            // height: getRandom(BUILDING_HEIGHT_MAX / 2, BUILDING_HEIGHT_MAX)
            width: getRandom(BUILDING_WIDTH_MAX, BUILDING_WIDTH_MAX),
            height: getRandom(BUILDING_HEIGHT_MAX, BUILDING_HEIGHT_MAX)
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
        this.defineWalls(building);
        this.removeWalls(building);
        // Redefine walls
        this.defineWalls(building);
        this.createDoors(building);
    }

    private defineWalls(building: Building) {
        building.cleanWalls();
        for (const place of building.iteratePlaces()) {
            const iterateAddWall = (iterator: IterableIterator<ReadOnlyPlace>, direction: string) => {
                const directionIterate = direction === "y" ? "y" : "x";
                const directionFixed = direction === "x" ? "y" : "x";
                let lastPlace: ReadOnlyPlace = place;

                for (const newPlace of iterator) {
                    let currentPlace = newPlace;
                    if (place.x !== newPlace.x || place.y !== newPlace.y) {
                        if (place[directionFixed] !== currentPlace[directionFixed] || !utils.isWall(newPlace)) {
                            currentPlace = lastPlace;
                        }
                        lastPlace = currentPlace;
                        const isCorner = utils.isCorner(currentPlace);
                        if (isCorner || currentPlace !== newPlace) {
                            const distance = Math.abs(place[directionIterate] - newPlace[directionIterate]);
                            if (distance >= 2) {
                                if (newPlace[directionIterate] > place[directionIterate]) {
                                    building.addWall(new Wall(place.coordinate, currentPlace.coordinate));
                                } else {
                                    building.addWall(new Wall(currentPlace.coordinate, place.coordinate));
                                }
                            }
                            break;
                        }
                    }
                    if (place[directionFixed] !== newPlace[directionFixed]) break;
                }
            };

            if (utils.isWall(place)) {
                if (utils.isWall(place.left) && utils.isWall(place.top)) {
                    const iteratePlaceX = building.iteratePlacesByDirection(Side.Left, place.coordinate);
                    const iteratePlaceY = building.iteratePlacesByDirection(Side.Top, place.coordinate);

                    iterateAddWall(iteratePlaceX, "x");
                    iterateAddWall(iteratePlaceY, "y");
                }
                if (utils.isWall(place.left) && utils.isWall(place.bottom)) {
                    const iteratePlaceX = building.iteratePlacesByDirection(Side.Left, place.coordinate);
                    const iteratePlaceY = building.iteratePlacesByDirection(Side.Bottom, place.coordinate);

                    iterateAddWall(iteratePlaceX, "x");
                    iterateAddWall(iteratePlaceY, "y");
                }
                if (utils.isWall(place.right) && utils.isWall(place.top)) {
                    const iteratePlaceX = building.iteratePlacesByDirection(Side.Right, place.coordinate);
                    const iteratePlaceY = building.iteratePlacesByDirection(Side.Top, place.coordinate);

                    iterateAddWall(iteratePlaceX, "x");
                    iterateAddWall(iteratePlaceY, "y");
                }
                if (utils.isWall(place.right) && utils.isWall(place.bottom)) {
                    const iteratePlaceX = building.iteratePlacesByDirection(Side.Right, place.coordinate);
                    const iteratePlaceY = building.iteratePlacesByDirection(Side.Bottom, place.coordinate);

                    iterateAddWall(iteratePlaceX, "x");
                    iterateAddWall(iteratePlaceY, "y");
                }
            }
        }
    }

    private removeWalls(building: Building) {
        for (const wall of building.walls) {
            if (!wall.outer) {
                const corner1 = building.getPlace(wall.corner1);
                const corner2 = building.getPlace(wall.corner2);
                const openingType: number = getRandom(1, 10);
                if (openingType === 2)
                    this.removeWall(building, corner1, corner2);
            }
        }
    }

    private createDoors(building: Building) {
        for (const wall of building.walls) {
            if (!wall.outer && !wall.looseEnd) {
                const corner1 = building.getPlace(wall.corner1);
                const corner2 = building.getPlace(wall.corner2);
                if (utils.isCorner(corner1) && utils.isCorner(corner2)) {
                    this.createDoor(building, corner1, corner2);
                }
            }
        }
    }

    private removeWall(building: Building, corner1: Coordinate, corner2: Coordinate) {
        if (corner1.x === corner2.x) {
            for (let y = corner1.y + 1; y < corner2.y; y++) {
                building.changePlaceType({ x: corner1.x, y }, PlaceType.Floor);
            }
        } else {
            for (let x = corner1.x + 1; x < corner2.x; x++) {
                building.changePlaceType({ x, y: corner1.y }, PlaceType.Floor);
            }
        }

        const corner1Place = building.getPlace(corner1);
        this.removeLooseWalls(building, corner1Place);
        const corner2Place = building.getPlace(corner2);
        this.removeLooseWalls(building, corner2Place);
    }

    private removeLooseWalls(building: Building, place: ReadOnlyPlace) {
        const iterateRemoveWalls = (side: Side) => {
            let position: "x" | "y" = "y";
            let sideText: "left" | "right" | "top" | "bottom" = "left";
            switch (side) {
                case Side.Left:
                    position = "y";
                    sideText = "left";
                    break;
                case Side.Right:
                    position = "y";
                    sideText = "right";
                    break;
                case Side.Top:
                    position = "x";
                    sideText = "top";
                    break;
                case Side.Bottom:
                    position = "x";
                    sideText = "bottom";
                    break;
            }

            let iterator = building.iteratePlacesByDirection(side, place);
            let remove: boolean = false;
            for (const newPlace of iterator) {
                if (newPlace !== place) {
                    if (newPlace[position] !== place[position]) break;
                    if (!utils.isCorner(newPlace) && !utils.isWall(newPlace[sideText])) {
                        remove = true;
                        break;
                    }
                    if (utils.isCorner(newPlace)) break;
                }
            }
            if (remove) {
                iterator = building.iteratePlacesByDirection(side, place);
                for (const newPlace of iterator) {
                    if (newPlace[position] !== place[position]) break;
                    building.changePlaceType(newPlace, PlaceType.Floor);
                    if (!utils.isCorner(newPlace) && !utils.isWall(newPlace[sideText])) {
                        break;
                    }
                }
            }
        };

        if (!utils.isCorner(place)) {
            if (utils.isWall(place.left) && !utils.isWall(place.right)) {
                iterateRemoveWalls(Side.Left);
            } else if (utils.isWall(place.right) && !utils.isWall(place.left)) {
                iterateRemoveWalls(Side.Right);
            } else if (utils.isWall(place.top) && !utils.isWall(place.bottom)) {
                iterateRemoveWalls(Side.Top);
            } else if (utils.isWall(place.bottom) && !utils.isWall(place.top)) {
                iterateRemoveWalls(Side.Bottom);
            } else if (!utils.isWall(place.left) &&
                !utils.isWall(place.right) &&
                !utils.isWall(place.bottom) &&
                !utils.isWall(place.top)) {
                building.changePlaceType(place, PlaceType.Floor);
            }
        }
    }

    private createDoor(building: Building, corner1: Coordinate, corner2: Coordinate) {
        // Door
        let door: Coordinate;
        if (corner1.x === corner2.x) {
            door = { x: corner1.x, y: getRandom(corner1.y + 1, corner2.y - 1) };
        } else {
            door = { x: getRandom(corner1.x + 1, corner2.x - 1), y: corner1.y };
        }
        building.changePlaceType(door, PlaceType.Door);
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
            x: getRandom(1, building.width - roomSize.width - 1),
            y: getRandom(1, building.height - roomSize.height - 1)
        };
        const iteratePlace = building.iteratePlacesByDirection(Side.Right, roomPosition);
        for (const place of iteratePlace) {
            const newX = place.x;
            const newY = place.y;

            const corner = utils.isCorner(building.getPlace({ x: newX, y: newY }));
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
                    if (!removedPlaces[place.x]) removedPlaces[place.x] = {};
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
