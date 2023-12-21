
import { Vector2D } from "../interfaces";
export class CelestialBody {
    position: Vector2D;
    mass: number;
    velocity: Vector2D;
    acceleration: Vector2D;
    radius: number;
    name: string;

    constructor(position: Vector2D, mass: number, velocity: Vector2D, radius: number, name: string) {
        this.position = position;
        this.mass = mass;
        this.velocity = velocity;
        this.acceleration = { x: 0, y: 0 };
        this.radius = radius;
        this.name = name;
    }


}
