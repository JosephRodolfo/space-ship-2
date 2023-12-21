import { Vector2D } from "../interfaces";
import { CelestialBody } from "./celestialBody";
export class Planet extends CelestialBody {

    constructor(position: Vector2D, mass: number, velocity: Vector2D, radius: number, name: string) {
        super(position, mass, velocity, radius, name);
    }
}