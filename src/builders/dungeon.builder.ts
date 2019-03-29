import { Chart } from "../models/charts/chart";
import { IBuilder } from "./interface.builder";
import { Dungeon } from "../models/charts/dungeon";
import { Dimensions } from "../models/dimensions";
import { DUNGEON_WIDTH_MAX, DUNGEON_HEIGHT_MAX, DUNGEON_FILL_PERCENT } from "../helpers/consts";
import { getRandom } from "../helpers/random-seed";
import { PlaceType } from "../models/enums/place-type";
import { showOnConsole, isWall, isEmpty } from "../helpers/chart.utils";
import { ReadOnlyPlace } from "../models/readonly-place";
import { Side } from "../models/enums/room-side";
import { TextFilePrinter } from "../printers/text-file.printer";
import { Coordinate } from "../models/coordinate";
import { Room } from "../models/room";
import _ from "underscore";

export class DungeonBuilder implements IBuilder {
    public generateMap(): Chart {
        const dungeonDimensions: Dimensions = {
            width: getRandom(DUNGEON_WIDTH_MAX, DUNGEON_WIDTH_MAX),
            height: getRandom(DUNGEON_HEIGHT_MAX, DUNGEON_HEIGHT_MAX)
        };
        const dungeon = new Dungeon(dungeonDimensions);
        this.fillDungeon(dungeon, DUNGEON_FILL_PERCENT);
        const printer = new TextFilePrinter();
        printer.print(dungeon);
        showOnConsole(dungeon);
        return dungeon;
    }

    public generateCustomMap(dungeonDimensions: Dimensions, fillPercent: number): Chart {
        const dungeon = new Dungeon(dungeonDimensions);

        this.fillDungeon(dungeon, fillPercent);
        const printer = new TextFilePrinter();
        printer.print(dungeon);
        showOnConsole(dungeon);
        return dungeon;
    }

    private fillDungeon(dungeon: Dungeon, fillPercent: number) {
        fillPercent = 60 - (fillPercent / 100 * 20);
        this.generateRandomNoise(dungeon, fillPercent);
        for (let index = 0; index < 5; index++) {
            this.smoothNoise(dungeon);
        }
        const rooms = this.generateRooms(dungeon);
        if (rooms.length > 0)
            this.generateHallways(dungeon, rooms);
    }

    private generateRandomNoise(dungeon: Dungeon, fillPercent: number) {
        const iterate = dungeon.iteratePosition();
        for (const position of iterate) {
            const randomPlaceType: PlaceType = getRandom(1, 100) <= fillPercent ? PlaceType.Wall : PlaceType.Floor;
            dungeon.changePlaceType(position, randomPlaceType);
        }
    }

    private smoothNoise(dungeon: Dungeon) {
        const randomSide: Side = getRandom(1, 4) as Side;
        const iterate = dungeon.iteratePlacesByDirection(randomSide, { x: 0, y: 0 });
        for (const place of iterate) {
            const wallCount = this.countWalls(place);

            if (place.x === 0 || place.y === 0 ||
                place.x === dungeon.width - 1 || place.y === dungeon.height - 1) {
                dungeon.changePlaceType(place.coordinate, PlaceType.Wall);
            } else {
                if (wallCount > 4)
                    dungeon.changePlaceType(place.coordinate, PlaceType.Wall);
                else if (wallCount < 4)
                    dungeon.changePlaceType(place.coordinate, PlaceType.Floor);
            }
        }
    }

    private generateRooms(dungeon: Dungeon): Room[] {
        const roomThresholdSize: number = 30;

        const roomRegionsWall: ReadOnlyPlace[][] = this.getRegions(dungeon, PlaceType.Wall);
        roomRegionsWall.forEach((roomRegion) => {
            if (roomRegion.length < roomThresholdSize) {
                roomRegion.forEach((position) => {
                    dungeon.changePlaceType(position, PlaceType.Floor);
                });
            }
        });

        let survivingRooms: Room[] = [];
        const roomRegionsFloor: ReadOnlyPlace[][] = this.getRegions(dungeon, PlaceType.Floor);
        roomRegionsFloor.forEach((roomRegion) => {
            if (roomRegion.length < roomThresholdSize) {
                roomRegion.forEach((position) => {
                    dungeon.changePlaceType(position, PlaceType.Wall);
                });
            } else {
                survivingRooms.push(new Room(roomRegion));
            }
        });
        if (survivingRooms.length > 0) {
            survivingRooms = _.sortBy(survivingRooms, (el) => el.roomSize);
            survivingRooms[0].isMainRoom = true;
            survivingRooms[0].isAccessibleFromMainRoom = true;
        }
        return survivingRooms;
    }

    private generateHallways(dungeon: Dungeon, allRooms: Room[], forceAccessibilityFromMainRoom: boolean = false) {
        let roomListA: Room[] = [];
        let roomListB: Room[] = [];

        if (forceAccessibilityFromMainRoom) {
            for (const room of allRooms) {
                if (room.isAccessibleFromMainRoom) {
                    roomListB.push(room);
                } else {
                    roomListA.push(room);
                }
            }
        } else {
            roomListA = allRooms;
            roomListB = allRooms;
        }

        let bestDistance = 0;
        let bestPlaceA: ReadOnlyPlace | null = null;
        let bestPlaceB: ReadOnlyPlace | null = null;
        let bestRoomA: Room | null = null;
        let bestRoomB: Room | null = null;
        let possibleConnectionFound = false;

        for (const roomA of roomListA) {
            if (!forceAccessibilityFromMainRoom) {
                possibleConnectionFound = false;
                if (roomA.connectedRooms.length > 0) {
                    continue;
                }
            }

            for (const roomB of roomListB) {
                if (roomA === roomB || roomA.isConnected(roomB)) {
                    continue;
                }

                for (const placeA of roomA.edgePlaces) {
                    for (const placeB of roomB.edgePlaces) {
                        const distanceBetweenRooms = ((placeA.x - placeB.x) ** 2) + ((placeA.y - placeB.y) ** 2);

                        if (distanceBetweenRooms < bestDistance || !possibleConnectionFound) {
                            bestDistance = distanceBetweenRooms;
                            possibleConnectionFound = true;
                            bestPlaceA = placeA;
                            bestPlaceB = placeB;
                            bestRoomA = roomA;
                            bestRoomB = roomB;
                        }
                    }
                }
            }
            if (possibleConnectionFound && !forceAccessibilityFromMainRoom) {
                if (bestRoomA && bestRoomB && bestPlaceA && bestPlaceB)
                    this.createPassage(dungeon, bestRoomA, bestRoomB, bestPlaceA, bestPlaceB);
            }
        }

        if (possibleConnectionFound && forceAccessibilityFromMainRoom) {
            if (bestRoomA && bestRoomB && bestPlaceA && bestPlaceB)
                this.createPassage(dungeon, bestRoomA, bestRoomB, bestPlaceA, bestPlaceB);
            this.generateHallways(dungeon, allRooms, true);
        }

        if (!forceAccessibilityFromMainRoom) {
            this.generateHallways(dungeon, allRooms, true);
        }
    }

    private createPassage(dungeon: Dungeon, roomA: Room, roomB: Room, placeA: ReadOnlyPlace, placeB: ReadOnlyPlace) {
        roomA.connectRooms(roomB);
        const line: Coordinate[] = this.getLine(placeA, placeB);
        for (const coor of line) {
            this.drawCircle(dungeon, coor, getRandom(2, 4));
        }
    }

    private drawCircle(dungeon: Dungeon, coor: Coordinate, range: number) {
        for (let x = -range; x <= range; x++) {
            for (let y = -range; y <= range; y++) {
                if (x * x + y * y <= range * range) {
                    const drawX = coor.x + x;
                    const drawY = coor.y + y;
                    if (dungeon.isInMapRange({ x: drawX, y: drawY })) {
                        dungeon.changePlaceType({ x: drawX, y: drawY }, PlaceType.Floor);
                    }
                }
            }
        }
    }

    private getLine(from: Coordinate, to: Coordinate): Coordinate[] {
        const line: Coordinate[] = [];

        let x = from.x;
        let y = from.y;

        const dx = to.x - from.x;
        const dy = to.y - from.y;

        let inverted = false;
        let step = Math.sign(dx);
        let gradientStep = Math.sign(dy);

        let longest = Math.abs(dx);
        let shortest = Math.abs(dy);

        if (longest < shortest) {
            inverted = true;
            longest = Math.abs(dy);
            shortest = Math.abs(dx);

            step = Math.sign(dy);
            gradientStep = Math.sign(dx);
        }

        let gradientAccumulation = longest / 2;
        for (let i = 0; i < longest; i++) {
            line.push({ x, y });

            if (inverted) {
                y += step;
            } else {
                x += step;
            }

            gradientAccumulation += shortest;
            if (gradientAccumulation >= longest) {
                if (inverted) {
                    x += gradientStep;
                } else {
                    y += gradientStep;
                }
                gradientAccumulation -= longest;
            }
        }

        return line;
    }

    private getRegions(dungeon: Dungeon, type: PlaceType): ReadOnlyPlace[][] {
        const regions: ReadOnlyPlace[][] = [];
        const mapFlags: any = {};

        for (let x = 0; x < dungeon.width; x++) {
            for (let y = 0; y < dungeon.height; y++) {
                const isNotFlagged = !mapFlags[x] || !mapFlags[x][y] || mapFlags[x][y] === 0;
                if (isNotFlagged && dungeon.getPlaceType({ x, y }) === type) {
                    const newRegion: ReadOnlyPlace[] = this.getRegionPlaces(dungeon, x, y, type);
                    regions.push(newRegion);
                    newRegion.forEach((position) => {
                        if (!mapFlags[position.x]) mapFlags[position.x] = {};
                        mapFlags[position.x][position.y] = 1;
                    });
                }
            }
        }

        return regions;
    }

    private getRegionPlaces(dungeon: Dungeon, startX: number, startY: number, type: PlaceType): ReadOnlyPlace[] {
        const places: ReadOnlyPlace[] = [];
        const mapFlags: any = {};

        const queue: ReadOnlyPlace[] = [];
        queue.push(dungeon.getPlace({ x: startX, y: startY }));
        if (!mapFlags[startX]) mapFlags[startX] = {};
        mapFlags[startX][startY] = 1;

        while (queue.length > 0) {
            const position: Coordinate | undefined = queue.pop();
            if (position) {
                places.push(dungeon.getPlace(position));

                for (let x = position.x - 1; x <= position.x + 1; x++) {
                    for (let y = position.y - 1; y <= position.y + 1; y++) {
                        if (dungeon.isInMapRange({ x, y }) && (y === position.y || x === position.x)) {
                            const isNotFlagged = !mapFlags[x] || !mapFlags[x][y] || mapFlags[x][y] === 0;
                            if (isNotFlagged && dungeon.getPlaceType({ x, y }) === type) {
                                if (!mapFlags[x]) mapFlags[x] = {};
                                mapFlags[x][y] = 1;
                                queue.push(dungeon.getPlace({ x, y }));
                            }
                        }
                    }
                }
            }
        }

        return places;
    }

    private countWalls(place: ReadOnlyPlace): number {
        let wallCount: number = 0;

        if (isWall(place.left) || isEmpty(place.left)) wallCount++;
        if (isWall(place.right) || isEmpty(place.right)) wallCount++;
        if (isWall(place.top) || isEmpty(place.top)) wallCount++;
        if (isWall(place.bottom) || isEmpty(place.bottom)) wallCount++;
        if (isWall(place.bottom.right) || isEmpty(place.bottom.right)) wallCount++;
        if (isWall(place.bottom.left) || isEmpty(place.bottom.left)) wallCount++;
        if (isWall(place.top.left) || isEmpty(place.top.left)) wallCount++;
        if (isWall(place.top.right) || isEmpty(place.top.right)) wallCount++;

        return wallCount;

    }
}
