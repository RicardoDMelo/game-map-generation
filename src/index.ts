import { BuildingBuilder } from "./builders/building.builder";
import { DungeonBuilder } from "./builders/dungeon.builder";
import { defineSeed, getRandom } from "./helpers/random-seed";

defineSeed("game");
console.log(getRandom(1, 100));

// const builder = new BuildingBuilder();
const builder = new DungeonBuilder();
builder.generateMap();
