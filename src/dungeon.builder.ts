import { Dungeon } from "./models/dungeon";
import { PlaceType } from "./enums/place-type";
import { ConsolePrinter } from "./printers/console.printer";
import { Place } from "./models/place";
import { getRandom } from "./helpers/utils";
import { WIDTH_ROOM_SIZE_MAX, WIDTH_ROOM_SIZE_MIN, HEIGHT_ROOM_SIZE_MIN, HEIGHT_ROOM_SIZE_MAX } from "./helpers/consts";
import { RoomSide } from "./enums/room-side";

export class DungeonBuilder {
    public generateMap = () => {
        const newDungeon = new Dungeon();
        this.generatePlaces(newDungeon);
        const printer = new ConsolePrinter();
        printer.print(newDungeon);
    }

    private generatePlaces(dungeon: Dungeon) {
        let lastPosition = this.generateRoom(dungeon, 0, 0);
        lastPosition = this.generateRoom(dungeon, lastPosition.x, lastPosition.y);
        lastPosition = this.generateRoom(dungeon, lastPosition.x, lastPosition.y);
        lastPosition = this.generateRoom(dungeon, lastPosition.x, lastPosition.y);
    }

    private generateRoom(dungeon: Dungeon, currentX: number, currentY: number) {
        let modifiers = { x: 1, y: 1 };
        if (currentX !== 0 || currentY !== 0) {
            const currentPlace: Place = dungeon.placesDictionary[currentX][currentY];
            modifiers = this.getNextRoomPositionModifiers(currentPlace);
        }

        const lastPosition: any = { x: currentX, y: currentY };
        const width = getRandom(WIDTH_ROOM_SIZE_MIN, WIDTH_ROOM_SIZE_MAX);
        const height = getRandom(HEIGHT_ROOM_SIZE_MIN, HEIGHT_ROOM_SIZE_MAX);
        if (modifiers != null) {
            for (let x = 0; x < width; x++) {
                for (let y = 0; y < height; y++) {
                    const type = (x === 0 || x === width - 1 || y === 0 || y === height - 1)
                        ? PlaceType.Wall : PlaceType.Empty;
                    lastPosition.x = currentX + (x * modifiers.x);
                    lastPosition.y = currentY + (y * modifiers.y);
                    dungeon.addPlace(lastPosition.x, lastPosition.y, type);
                }
            }
        }

        return lastPosition;
    }

    private getNextRoomPositionModifiers(currentPlace: Place): any {
        let position = getRandom(1, 4);
        let counterPosition = 0;
        while (counterPosition < 4) {
            if (position === RoomSide.Top) {
                if (currentPlace.top == null || currentPlace.top.type === PlaceType.Empty) {
                    return { x: 1, y: -1 };
                } else {
                    position++;
                    counterPosition++;
                }
            }
            if (position === RoomSide.Right) {
                if (currentPlace.right == null || currentPlace.right.type === PlaceType.Empty) {
                    return { x: 1, y: 1 };
                } else {
                    position++;
                    counterPosition++;
                }
            }
            if (position === RoomSide.Bottom) {
                if (currentPlace.bottom == null || currentPlace.bottom.type === PlaceType.Empty) {
                    return { x: -1, y: 1 };
                } else {
                    position++;
                    counterPosition++;
                }
            }
            if (position === RoomSide.Left) {
                if (currentPlace.left == null || currentPlace.left.type === PlaceType.Empty) {
                    return { x: -1, y: -1 };
                } else {
                    position = 1;
                    counterPosition++;
                }
            }
        }
        return null;
    }

}
