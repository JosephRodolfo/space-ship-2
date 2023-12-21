import { Vector2D } from "../interfaces";
import { Physics } from "./physics";
const physics = new Physics();
export class Ship {
    name: string;
    position: Vector2D;
    velocity: Vector2D;
    mass: number;
    radius: number;
    acceleration: Vector2D;
    firingThruster: boolean;
    private _rotationAngle?: number; 
    constructor(name: string, mass: number, position: Vector2D, velocity: Vector2D, radius: number) {
            
        this.name = name;
        this.mass = mass;
        this.radius = radius;
        this.position = position; 
        this.velocity = velocity; 
        this.acceleration = { x: 0, y: 0 };
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
    advanceTimeStep(totalForce: Vector2D, timeStep: number) {
        const newAcceleration = physics.calculateAcceleration({
            force: totalForce,
            mass: this.mass
          })
          this.updateAcceleration(newAcceleration);
          const newVelocity = physics.calculateVelocity({
            acceleration: newAcceleration,
            initialVelocity: this.velocity,
            timeStep,
          })
          this.updateVelocity(newVelocity);
          const newPosition = physics.calculatePosition({
            position: this.position,
            velocity: this.velocity,
            timeStep: timeStep,
          })
          this.updatePositionNew(newPosition);     
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
