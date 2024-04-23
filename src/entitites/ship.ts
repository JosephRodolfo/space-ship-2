import { Vector2D } from "../interfaces";
import { CelestialBody } from "./celestialBody";
import { Physics } from "./physics";
export class Ship extends CelestialBody {
  firingThruster: boolean;
  private _rotationAngle?: number;
  thrustIncrement: number;
  maxThrust: number;
  currentThrustX: number;
  currentThrustY: number;
  rotationIncrement: number;
  physics: Physics;

  constructor(
    name: string,
    mass: number,
    position: Vector2D,
    velocity: Vector2D,
    radius: number,
  ) {
    super(position, mass, velocity, radius, name);
    this._rotationAngle = 0;
    this.firingThruster = false;
    this.thrustIncrement = 0.000001 * 1000000000000;
    this.maxThrust = Number.POSITIVE_INFINITY;
    this.currentThrustY = 0;
    this.currentThrustX = 0;
    this.rotationIncrement = 3 * (Math.PI / 180);
    this.physics = new Physics();
  }

  applyThrust(force: Vector2D, timeStep: number) {
    const scaledForce = {
      x: force.x! * timeStep,
      y: force.y! * timeStep,
    };

    this.acceleration!.x! += scaledForce.x / this.mass! || 0;
    this.acceleration!.y! += scaledForce.y / this.mass! || 0;
  }
  updateVelocity(velocity: Vector2D) {
    this.velocity!.x = velocity.x;
    this.velocity!.y = velocity.y;
  }
  updateAcceleration(acceleration: Vector2D) {
    this.acceleration!.x = acceleration.x;
    this.acceleration!.y = acceleration.y;
  }
  get rotationAngle(): number {
    if (this.acceleration!.x === 0 && this.acceleration!.y === 0) {
      return this._rotationAngle!;
    }
    return this._rotationAngle!;
  }
  addRotation(direction: number) {
    this._rotationAngle! += direction * this.rotationIncrement;
    this._rotationAngle! %= Math.PI * 2;
  }

}
