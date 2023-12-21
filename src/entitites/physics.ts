import { Vector2D } from "../interfaces";
import { Ship } from "./ship";
const G = 6.674 * Math.pow(10, -11);
export class Physics {
  constructor() {}

  calculateGravitationalForce(ship1: Ship, ship2: Ship): Vector2D {
    const { distance, distanceX, distanceY } = this.calculateDistance(
      ship1.position,
      ship2.position
    );

    const forceMagnitude = (G * ship1.mass * ship2.mass) / distance ** 2;

    const forceDirection = {
      x: distanceX / distance,
      y: distanceY / distance,
    };

    return {
      x: forceDirection.x * forceMagnitude,
      y: forceDirection.y * forceMagnitude,
    };
  }

  calculateDistance(point1: Vector2D, point2: Vector2D) {
    const distanceX = point2.x! - point1.x!;
    const distanceY = point2.y! - point1.y!;
    return {
      distance: Math.sqrt(distanceX ** 2 + distanceY ** 2),
      distanceX,
      distanceY,
    };
  }
  calculateVelocity({
    acceleration,
    initialVelocity,
    timeStep
  }: {
    acceleration: Vector2D;
    initialVelocity: Vector2D;
    timeStep: number;
  }): Vector2D {
    return {
        // const scaledForce = {
        //     x: force.x! * timeStep,
        //     y: force.y! * timeStep
        // };
    
        // this.acceleration.x! += (scaledForce.x / this.mass) || 0;
        // this.acceleration.y! += (scaledForce.y / this.mass) || 0;
      x: initialVelocity.x! += acceleration.x! * timeStep,
      y: initialVelocity.y! += acceleration.y! * timeStep,
    };
  }
  calculateAcceleration({
    force,
    mass,
  }: {
    force: Vector2D;
    mass: number;
  }): Vector2D {
    return {
      x: force.x! / mass,
      y: force.y! / mass
    };
  }
  
  calculatePosition({
    position,
    velocity,
    timeStep
  }: {
    position: Vector2D;
    velocity: Vector2D;
    timeStep: number;
  }) {
    return {
        x: position.x! + (velocity.x! * timeStep),
        y: position.y! + (velocity.y! * timeStep),
    }
}
  //   calculateTrajectory(ship: Ship, otherBodies: Ship[], window: number[]) {

  //   }
}
