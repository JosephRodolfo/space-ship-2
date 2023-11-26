import { Vector2D } from "../interfaces";

export class Ship {
    name: string;
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    acceleration: Vector2D;
    constructor(name: string, mass: number, position: Vector2D, velocity: Vector2D) {
            
        this.name = name;
        this.mass = mass;
        this.position = position; 
        this.velocity = velocity; 
        this.acceleration = { x: 0, y: 0};
    }

    applyThrust({ x = 0, y = 0 }: Vector2D) {
        this.acceleration.x! += x || 0;
        this.acceleration.y! += y || 0;
    }

    updatePhysics(timeStep: number) {
        this.velocity.x! += this.acceleration.x! * timeStep;
        this.velocity.y! += this.acceleration.y! * timeStep;

        // // Update position based on velocity
        // this.position.x! += this.velocity.x! * timeStep;
        // this.position.y! += this.velocity.y! * timeStep;
    }
    updatePosition(timeStep: number) {
        this.position.x! += this.velocity.x! * timeStep;
        this.position.y! += this.velocity.y! * timeStep;
    }

}
