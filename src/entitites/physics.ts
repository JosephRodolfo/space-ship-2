import { Vector2D } from "../interfaces";
import { Ship } from "./ship";
import { Planet } from "./planet";
import { CelestialBody } from "./celestialBody";
const G = 6.674 * Math.pow(10, -11);
export class Physics {
  constructor() {}

  calculateGravitationalForce(ship1: CelestialBody, ship2: Planet): Vector2D {
    const { distance, distanceX, distanceY } = this.calculateDistance(
      ship1.position,
      ship2.position
    );

    const forceMagnitude = (G * ship1.mass! * ship2.mass!) / distance ** 2;

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
    otherBodies,
    thrustForce,
    timeStep,
    callback,
  }: {
    ship: Ship;
    otherBodies: Planet[]
      thrustForce: Vector2D,
      timeStep: number;
      isTrajectory?: boolean,
    callback: (result: {
      newPosition: Vector2D;
      newAcceleration: Vector2D;
      newVelocity: Vector2D;
      otherBodiesState: Planet[],
    }) => void;
    }) {
    // const filteredBodies = isTrajectory ? otherBodies.filter(({ name }) => name === 'earth') : otherBodies;
    // revisit why it was doing this, it was causing a problem when the sun was the only other body,
    // but I'm not sure it was ever necessary
    const filteredBodies = otherBodies;
    const totalForces = this.sumForces(filteredBodies, ship);
    totalForces.x! += thrustForce.x!;
    totalForces.y! += thrustForce.y!;

    
    const newAcceleration = this.calculateAcceleration({
      force: totalForces,
      mass: ship.mass!,
    });

    const newVelocity = this.calculateVelocity({
      acceleration: newAcceleration,
      initialVelocity: ship.velocity!,
      timeStep,
    });

    const newPosition = this.calculatePosition({
      position: ship.position,
      velocity: newVelocity,
      timeStep,
    });

    const otherBodiesState: Planet[] = otherBodies.map(planet => {
      return this.calculateCelestialBody(planet, otherBodies.filter(b => b !== planet), timeStep);
    });

    callback({
      newPosition,
      newAcceleration,
      newVelocity,
      otherBodiesState,
    });
  }

  calculateCelestialBody(body: CelestialBody, otherBodies: CelestialBody[], timeStep: number) {
    const forces = this.sumForces(otherBodies, body);

    const acceleration = this.calculateAcceleration({
      force: forces,
      mass: body.mass!,
    });

    const velocity = this.calculateVelocity({
      acceleration: acceleration,
      initialVelocity: body.velocity!,
      timeStep,
    });

    const position = this.calculatePosition({
      position: body.position,
      velocity: velocity,
      timeStep,
    });

    return {
      position,
      acceleration,
      velocity,
      name: body.name,
    } as Planet
  }
  sumForces(otherBodies: Planet[] = [], ship: CelestialBody) {
    return otherBodies.reduce(
      (accumulatedForce: Vector2D, otherShip: Planet) => {
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
    otherBodies: Planet[],
    window: [number, number],
    timeStep: number,
  ) {
    const [startTime, endTime] = window;
    let trajectory: Vector2D[] = [];
    const currentShipState = structuredClone(ship);
    let celestialBodies = otherBodies.map(obj => structuredClone(obj));
    for (let time = startTime; time <= endTime; time += timeStep) {
      this.advanceTimeStep({
        ship: currentShipState as Ship,
        thrustForce: { x: 0, y: 0 },
        otherBodies: celestialBodies,
        timeStep,
        isTrajectory: true,
        callback: ({ newPosition, newVelocity, newAcceleration, otherBodiesState }) => {
          trajectory.push({ ...newPosition, index: time } as { x: number, y: number, index: number })
          currentShipState.position = newPosition;
          currentShipState.velocity = newVelocity;
          currentShipState.acceleration = newAcceleration;
          celestialBodies = otherBodiesState.map((state) => {
            const body = celestialBodies.find(({ name }) => name === state.name);
            if (!body) {
              return state;
            }
            return body;
        });
      }
      });
    }
    return {
      trajectory,
      finalShipState: {
        acceleration: currentShipState.acceleration,
        velocity: currentShipState.velocity,
        position: trajectory[trajectory.length - 1],
        mass: currentShipState.mass,
      }
    };
  }
  detectCollision(circle1: CelestialBody, circle2: CelestialBody) {
    const dx = circle1.position.x! - circle2.position.x!;
    const dy = circle1.position.y! - circle2.position.y!;
    const distanceSquared = dx * dx + dy * dy;
    const radiusSumSquared = (circle1.radius! + circle2.radius!) * (circle1.radius! + circle2.radius!);
    return distanceSquared < radiusSumSquared;
  }
  calculateOribitalVelocity(distance: number, mass: number) {
    return Math.sqrt(G * mass / distance);
  }
  calculateRelativeVelocity(shipVelocity: Vector2D, referenceBodyVelocity: Vector2D) {
    return {
      x: shipVelocity.x! - referenceBodyVelocity.x!,
      y: shipVelocity.y! - referenceBodyVelocity.y!,
    };
  }
  calculateRelativePosition(shipPosition: Vector2D, referenceBodyPosition: Vector2D) {
    return {
      x: shipPosition.x! - referenceBodyPosition.x!,
      y: shipPosition.y! - referenceBodyPosition.y!,
    };
  }
  calculateRelativeAcceleration(shipAcceleration: Vector2D, referenceBodyAcceleration: Vector2D) {
    return {
      x: shipAcceleration.x! - referenceBodyAcceleration.x!,
      y: shipAcceleration.y! - referenceBodyAcceleration.y!,
    };
  }
}
