import { Vector2D } from "../interfaces";

export class Ship {
    name: string;
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
    acceleration: Vector2D;
    private _rotationAngle?: number; 
    constructor(name: string, mass: number, position: Vector2D, velocity: Vector2D, radius: number) {
            
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.position = position; 
        this.velocity = velocity; 
        this.acceleration = { x: 0, y: 0 };
        this._rotationAngle = 0;
    }

    applyThrust({ x = 0, y = 0 }: Vector2D) {
        this.acceleration.x! += x || 0;
        this.acceleration.y! += y || 0;
    }

    updatePhysics(timeStep: number) {
        this.velocity.x! += this.acceleration.x! * timeStep;
        this.velocity.y! += this.acceleration.y! * timeStep;
    }
    updatePosition(timeStep: number) {
        this.position.x! += this.velocity.x! * timeStep;
        this.position.y! += this.velocity.y! * timeStep;
    }
    get rotationAngle(): number {
        if (this.acceleration.x === 0 && this.acceleration.y === 0) {
            // No acceleration, return the current angle
            return this._rotationAngle!;
        }
    
        // Update and return the new rotation angle based on acceleration
        // Adjust by 90 degrees (π/2 radians)
        // this._rotationAngle = Math.atan2(this.acceleration.y!, this.acceleration.x!) + Math.PI / 2;
        return this._rotationAngle!;
    }
    addRotation(delta: number) {
        this._rotationAngle! += delta;
        // Normalize the rotation angle to keep it within the range of 0 to 2π
        this._rotationAngle! %= Math.PI * 2;
    }

}
