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
    timeStep,
  }: {
    acceleration: Vector2D;
    initialVelocity: Vector2D;
    timeStep: number;
  }): Vector2D {
    return {
      x: (initialVelocity.x! += acceleration.x! * timeStep),
      y: (initialVelocity.y! += acceleration.y! * timeStep),
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
      y: force.y! / mass,
    };
  }

  calculatePosition({
    position,
    velocity,
    timeStep,
  }: {
    position: Vector2D;
    velocity: Vector2D;
    timeStep: number;
  }) {
    return {
      x: position.x! + velocity.x! * timeStep,
      y: position.y! + velocity.y! * timeStep,
    };
  }
  advanceTimeStep({
    ship,
    totalForce,
    timeStep,
    callback,
  }: {
    ship: Ship;
    totalForce: Vector2D;
    timeStep: number;
    callback: (result: {
      newPosition: Vector2D;
      newAcceleration: Vector2D;
      newVelocity: Vector2D;
    }) => void;
  }) {
    const newAcceleration = this.calculateAcceleration({
      force: totalForce,
      mass: ship.mass,
    });

    const newVelocity = this.calculateVelocity({
      acceleration: newAcceleration,
      initialVelocity: ship.velocity,
      timeStep,
    });

    const newPosition = this.calculatePosition({
      position: ship.position,
      velocity: newVelocity,
      timeStep,
    });

    callback({
      newPosition,
      newAcceleration,
      newVelocity,
    });
  }
  sumForces(otherBodies: Ship[] = [], ship: Ship) {
    return otherBodies.reduce(
      (accumulatedForce: Vector2D, otherShip: Ship) => {
        const gravitationalForce = this.calculateGravitationalForce(
          ship,
          otherShip
        );
        return {
          x: accumulatedForce.x! + gravitationalForce.x!,
          y: accumulatedForce.y! + gravitationalForce.y!,
        };
      },
      { x: 0, y: 0 }
    );
  }

  calculateTrajectory(
    ship: Ship,
    otherBodies: Ship[],
    window: [number, number]
  ) {
    const [startTime, endTime] = window;
    const timeStep = 1;
    let trajectory: Vector2D[] = [];
    let currentShipState = { ...ship }; // Clone the ship state to avoid mutating the original ship

    for (let time = startTime; time <= endTime; time += timeStep) {
      const totalForce = this.sumForces(otherBodies, currentShipState as Ship);

      this.advanceTimeStep({
        ship: currentShipState as Ship,
        totalForce,
        timeStep,
        callback: ({ newPosition, newVelocity, newAcceleration }) => {
          trajectory.push(newPosition);
          currentShipState.position = newPosition;
          currentShipState.velocity = newVelocity;
          currentShipState.acceleration = newAcceleration;
        },
      });
    }

    return trajectory;
  }
}
