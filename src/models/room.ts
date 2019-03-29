import { isWall } from "../helpers/chart.utils";
import { ReadOnlyPlace } from "./readonly-place";
import _ from "underscore";

export class Room {
    public places: ReadOnlyPlace[];
    public edgePlaces: ReadOnlyPlace[];
    public connectedRooms: Room[];
    public roomSize: number;
    public isAccessibleFromMainRoom: boolean = false;
    public isMainRoom: boolean = false;

    constructor(roomPlaces: ReadOnlyPlace[]) {
        this.places = roomPlaces;
        this.roomSize = this.places.length;
        this.connectedRooms = [];

        this.edgePlaces = [];
        const addEdgePlace = (place: ReadOnlyPlace) => {
            if (isWall(place) && !_.any(this.edgePlaces, (el) => el.x === place.x && el.y === place.y))
                this.edgePlaces.push(place);
        };
        for (const place of this.places) {
            addEdgePlace(place.left);
            addEdgePlace(place.right);
            addEdgePlace(place.top);
            addEdgePlace(place.bottom);
        }
    }

    public setAccessibleFromMainRoom() {
        if (!this.isAccessibleFromMainRoom) {
            this.isAccessibleFromMainRoom = true;
            for (const connectedRoom of this.connectedRooms) {
                connectedRoom.setAccessibleFromMainRoom();
            }
        }
    }

    public connectRooms(otherRoom: Room) {
        if (this.isAccessibleFromMainRoom) {
            otherRoom.setAccessibleFromMainRoom();
        } else if (otherRoom.isAccessibleFromMainRoom) {
            this.setAccessibleFromMainRoom();
        }
        this.connectedRooms.push(otherRoom);
        otherRoom.connectedRooms.push(this);
    }

    public isConnected(otherRoom: Room): boolean {
        return _.any(this.connectedRooms, (el) => el === otherRoom);
    }
}
