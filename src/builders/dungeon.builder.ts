import { Chart } from "../models/charts/chart";
import { IBuilder } from "./interface.builder";
import { Dungeon } from "../models/charts/dungeon";
import { Dimensions } from "../models/dimensions";
import { DUNGEON_WIDTH_MAX, DUNGEON_HEIGHT_MAX } from "../helpers/consts";
import { getRandom } from "../helpers/random-seed";
import { PlaceType } from "../models/enums/place-type";
import { showOnConsole, isWall, isEmpty } from "../helpers/chart.utils";
import { ReadOnlyPlace } from "../models/readonly-place";
import { Side } from "../models/enums/room-side";
import { TextFilePrinter } from "../printers/text-file.printer";
import { Coordinate } from "../models/coordinate";

export class DungeonBuilder implements IBuilder {
    public generateMap(): Chart {
        const dungeonDimensions: Dimensions = {
            width: getRandom(DUNGEON_WIDTH_MAX, DUNGEON_WIDTH_MAX),
            height: getRandom(DUNGEON_HEIGHT_MAX, DUNGEON_HEIGHT_MAX)
        };
        const dungeon = new Dungeon(dungeonDimensions);

        this.fillDungeon(dungeon);
        const printer = new TextFilePrinter();
        printer.print(dungeon);
        showOnConsole(dungeon);
        return dungeon;
    }

    private fillDungeon(dungeon: Dungeon) {
        this.generateRandomNoise(dungeon);
        for (let index = 0; index < 5; index++) {
            this.smoothNoise(dungeon);
        }
        this.cleanLooseWalls(dungeon);
    }

    private generateRandomNoise(dungeon: Dungeon) {
        const iterate = dungeon.iteratePosition();
        for (const position of iterate) {
            const randomPlaceType: PlaceType = getRandom(1, 100) <= 50 ? PlaceType.Wall : PlaceType.Floor;
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

    private cleanLooseWalls(dungeon: Dungeon) {
        const roomRegions: Coordinate[][] = this.getRegions(dungeon, PlaceType.Wall);
        const roomThresholdSize: number = 30;

        roomRegions.forEach((roomRegion) => {
            if (roomRegion.length < roomThresholdSize) {
                roomRegion.forEach((position) => {
                    dungeon.changePlaceType(position, PlaceType.Floor);
                });
            }
        });
    }

    private getRegions(dungeon: Dungeon, type: PlaceType): Coordinate[][] {
        const regions: Coordinate[][] = [];
        const mapFlags: any = {};

        for (let x = 0; x < dungeon.width; x++) {
            for (let y = 0; y < dungeon.height; y++) {
                const isNotFlagged = !mapFlags[x] || !mapFlags[x][y] || mapFlags[x][y] === 0;
                if (isNotFlagged && dungeon.getPlaceType({ x, y }) === type) {
                    const newRegion: Coordinate[] = this.getRegionTiles(dungeon, x, y, type);
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

    private getRegionTiles(dungeon: Dungeon, startX: number, startY: number, type: PlaceType): Coordinate[] {
        const tiles: Coordinate[] = [];
        const mapFlags: any = {};

        const queue: Coordinate[] = [];
        queue.push({ x: startX, y: startY });
        if (!mapFlags[startX]) mapFlags[startX] = {};
        mapFlags[startX][startY] = 1;

        while (queue.length > 0) {
            const position: Coordinate | undefined = queue.pop();
            if (position) {
                tiles.push(position);

                for (let x = position.x - 1; x <= position.x + 1; x++) {
                    for (let y = position.y - 1; y <= position.y + 1; y++) {
                        if (dungeon.isInMapRange({ x, y }) && (y === position.y || x === position.x)) {
                            const isNotFlagged = !mapFlags[x] || !mapFlags[x][y] || mapFlags[x][y] === 0;
                            if (isNotFlagged && dungeon.getPlaceType({ x, y }) === type) {
                                if (!mapFlags[x]) mapFlags[x] = {};
                                mapFlags[x][y] = 1;
                                queue.push({ x, y });
                            }
                        }
                    }
                }
            }
        }

        return tiles;
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
