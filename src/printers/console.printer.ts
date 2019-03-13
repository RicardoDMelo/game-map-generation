import { Dungeon } from "../models/dungeon";
import { Place } from "../models/place";

export class ConsolePrinter {
    print(dungeon: Dungeon){
        let mapPrint = "";
        for(let x = dungeon.minWidth; x <= dungeon.maxWidth; x++){
            for(let y = dungeon.minHeight; y <= dungeon.maxHeight; y++){
                const currentPlace: Place = dungeon.placesDictionary[x][y];
                if(currentPlace != null){
                    mapPrint += currentPlace.type.toString();
                }
            }
            mapPrint += "\n";
        }
        console.log(mapPrint);
    }    
}