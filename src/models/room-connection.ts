import { Room } from "./room";

export interface RoomConnection {
    doorLocation: number;
    doorLocationChild: number;
    doorSide: number;
    room: Room;
}
