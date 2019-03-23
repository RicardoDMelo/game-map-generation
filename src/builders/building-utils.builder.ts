import { PlaceType } from "../enums/place-type";
import { Building } from "../models/building";
import { Dimensions } from "../models/dimensions";
import { Coordinate } from "../models/coordinate";
import { ConsolePrinter } from "../printers/console.printer";
import { ReadOnlyPlace } from "../models/readonly-place";
import { Wall } from "../models/wall";

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

export function isWall(place: ReadOnlyPlace | null): boolean {
    return place != null && place.type === PlaceType.Wall;
}
export function isLooseEnd(building: Building, wall: Wall): boolean {
    return !isCorner(building.getPlace(wall.corner1)) || !isCorner(building.getPlace(wall.corner1));
}

export function isOuterWall(building: Building, wall: Wall): boolean {
    for (let y = wall.corner1.y; y <= wall.corner2.y; y++) {
        for (let x = wall.corner1.x; x <= wall.corner2.x; x++) {
            const place: ReadOnlyPlace = building.getPlace({ x, y });
            if (isWall(place)) {
                const isLeft = place.left.type === PlaceType.Empty;
                const isRight = place.right.type === PlaceType.Empty;
                const isTop = place.top.type === PlaceType.Empty;
                const isBottom = place.bottom.type === PlaceType.Empty;

                if (!isCorner(place) && (isLeft || isRight || isTop || isBottom))
                    return true;
            }
        }
    }
    return false;
}

export function isCorner(place: ReadOnlyPlace): boolean {
    if (isWall(place)) {
        const isLeft = isWall(place.left);
        const isRight = isWall(place.right);
        const isTop = isWall(place.top);
        const isBottom = isWall(place.bottom);

        return (isLeft && isTop) || (isLeft && isBottom) || (isRight && isTop) || (isRight && isBottom);
    }
    return false;
}
