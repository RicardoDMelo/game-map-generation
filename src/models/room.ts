import {
    HEIGHT_ROOM_SIZE_MAX,
    HEIGHT_ROOM_SIZE_MIN,
    WIDTH_ROOM_SIZE_MAX,
    WIDTH_ROOM_SIZE_MIN,
} from "../helpers/consts";
import { getRandom } from "../helpers/utils";
import { RoomConnection } from "./room-connection";

export class Room {
    public width: number;
    public height: number;
    public roomConnections: RoomConnection[] = [];

    constructor(height: number | null, width: number | null) {
        this.width = width || this.generateWidthSize();
        this.height = height || this.generateHeightSize();
    }

    public printRoomDetails = () => {
        console.log(`Height: ${this.height}`);
        console.log(`Width: ${this.width}`);
    }

    private generateWidthSize = (): number => {
        return Math.round(getRandom(WIDTH_ROOM_SIZE_MIN, WIDTH_ROOM_SIZE_MAX));
    }
    private generateHeightSize = (): number => {
        return Math.round(getRandom(HEIGHT_ROOM_SIZE_MIN, HEIGHT_ROOM_SIZE_MAX));
    }
}
