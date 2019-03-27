
import seedrandom from "seedrandom";
let rng: seedrandom.prng = seedrandom();

export function defineSeed(seed: string) {
    rng = seedrandom(seed);
}

export function getRandom(min: number, max: number): number {
    return Math.round(rng() * (max - min) + min);
}
