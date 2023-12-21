import { Vector2D } from "../interfaces";
import { CelestialBody } from "./celestialBody";
export class Ship extends CelestialBody {
    firingThruster: boolean;
    private _rotationAngle?: number; 
    constructor(name: string, mass: number, position: Vector2D, velocity: Vector2D, radius: number) {
        super(position, mass, velocity, radius, name);
        this._rotationAngle = 0;
        this.firingThruster = false;
    }

    // applyThrust({ x = 0, y = 0 }: Vector2D) {
    //     this.acceleration.x! += x || 0;
    //     this.acceleration.y! += y || 0;
    // }

    applyThrust(force: Vector2D, timeStep: number) {
        const scaledForce = {
            x: force.x! * timeStep,
            y: force.y! * timeStep
        };
    
        this.acceleration.x! += (scaledForce.x / this.mass) || 0;
        this.acceleration.y! += (scaledForce.y / this.mass) || 0;
        }    
    updateVelocity(velocity: Vector2D) {
        
        this.velocity.x = velocity.x;
        this.velocity.y = velocity.y
    }    
    updateAcceleration(acceleration: Vector2D) {
        this.acceleration.x = acceleration.x;
        this.acceleration.y = acceleration.y
    }
    updatePositionNew(position: Vector2D) {
        this.position.x = position.x;
        this.position.y = position.y;
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
            return this._rotationAngle!;
        }
        return this._rotationAngle!;
    }
    addRotation(delta: number) {
        this._rotationAngle! += delta;
        this._rotationAngle! %= Math.PI * 2;
    }

}
