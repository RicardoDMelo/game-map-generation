import { PlaceType } from "../enums/place-type";
import { Building } from "../models/building";
import { Dimensions } from "../models/dimensions";
import { Coordinate } from "../models/coordinate";
import { ConsolePrinter } from "../printers/console.printer";
import { ReadOnlyPlace } from "../models/readonly-place";

export function isWall(place: ReadOnlyPlace | null): boolean {
    return place != null && place.type === PlaceType.Wall;
}

export function showOnConsole(building: Building) {
    const printer = new ConsolePrinter();
    printer.print(building);
}

export function verifyIfDoubleWallX(place: ReadOnlyPlace | null, alreadyRemovedBottom: boolean) {
    if (place && place.top && place.bottom) {
        const isRight = isWall(place.right) && isWall(place.top) && isWall(place.top.right) &&
            (isWall(place.bottom.right) || alreadyRemovedBottom);

        const isLeft = isWall(place.left) && isWall(place.top) && isWall(place.top.left) &&
            (isWall(place.bottom.left) || alreadyRemovedBottom);

        const xorLeftRight = (isWall(place.left) || isWall(place.right)) &&
            !(isWall(place.left) && isWall(place.right));

        return isWall(place) && (isLeft || isRight) && xorLeftRight;
    }
    return false;
}

export function verifyIfDoubleWallY(place: ReadOnlyPlace | null, alreadyRemovedLeft: boolean) {
    if (place && place.right && place.left) {
        const isTop = isWall(place.top) && isWall(place.right) && isWall(place.right.top) &&
            (isWall(place.left.top) || alreadyRemovedLeft);

        const isBottom =
            isWall(place.bottom) && isWall(place.right) && isWall(place.right.bottom) &&
            (isWall(place.left.bottom) || alreadyRemovedLeft);

        const xorTopBottom = (isWall(place.top) || isWall(place.bottom)) &&
            !(isWall(place.top) && isWall(place.bottom));

        return isWall(place) && (isTop || isBottom) && xorTopBottom;
    }
    return false;
}

export function hasEnoughSpace(building: Building, roomSize: Dimensions, position: Coordinate): boolean {
    const isEmpty = building.getPlaceType(position) === PlaceType.Empty;
    const isEnoughWidth = building.isEnoughWidth(position, roomSize.width);
    const isEnoughHeight = building.isEnoughHeight(position, roomSize.height);

    return isEmpty && isEnoughWidth && isEnoughHeight;
}

export function isCorner(building: Building, position: Coordinate): boolean {
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
