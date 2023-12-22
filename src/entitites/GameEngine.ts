import { Ship } from "./ship";
import { Planet } from "./planet";
import { Physics } from "./physics";
import { Ref } from "vue";

export class GameEngine {
  ship: Ship;
  otherObjects: Planet[];
  keysPressed: Set<string>;
  speed: Ref<number>

  frameRef: number | null;
  thrustIntervalX: number | null;
  thrustIntervalY: number | null;
  positionInterval: number | null;
  physics: Physics;

  constructor(
    ship: Ship,
    otherObjects: Planet[],
    keysPressed: Set<string>,
    speed:  Ref<number>,
    physics: Physics
  ) {
    this.ship = ship;
    this.otherObjects = otherObjects;
    this.keysPressed = keysPressed;
    this.speed = speed;
    this.frameRef = null;
    this.thrustIntervalY = null;
    this.thrustIntervalX = null;
    this.positionInterval = null;
    this.physics = physics;
  }

  start() {
    this.frameRef = requestAnimationFrame(this.update.bind(this));
  }
  stop() {
    if (this.frameRef) {
      cancelAnimationFrame(this.frameRef);
    }
  }
  update() {
    const totalForce = { x: 0, y: 0 };

    if (this.keysPressed.has("w")) {
      const thrusterForce = this.applyThrust("up");
      totalForce.x += thrusterForce!.x;
        totalForce.y += thrusterForce!.y;
        this.ship.firingThruster = true;
    } else {
        this.ship.firingThruster = false;
    }

    if (this.keysPressed.has("a")) {
      this.ship.addRotation(-1);
    }
    if (this.keysPressed.has("d")) {
      this.ship.addRotation(1);
    }

    this.physics.advanceTimeStep({
      ship: this.ship,
      otherBodies: this.otherObjects,
      thrustForce: totalForce,
      timeStep: this.speed.value,
      callback: ({ newAcceleration, newVelocity, newPosition }) => {
        this.ship.updateAcceleration(newAcceleration);
        this.ship.updateVelocity(newVelocity);
        this.ship.updatePositionNew(newPosition);
      },
    });

    this.frameRef = requestAnimationFrame(this.update.bind(this));
  }

  applyThrust(direction: "up" | "down" | "left" | "right") {
    if (direction === "up" || direction === "down") {
      this.ship.currentThrustY = Math.min(
        this.ship.currentThrustY + this.ship.thrustIncrement,
        this.ship.maxThrust
      );
      this.ship.currentThrustX = Math.min(
        this.ship.currentThrustY + this.ship.thrustIncrement,
        this.ship.maxThrust
      );

      const x =
        this.ship.currentThrustX *
        Math.cos(this.ship.rotationAngle - Math.PI / 2);
      const y =
        this.ship.currentThrustY *
        Math.sin(this.ship.rotationAngle - Math.PI / 2);
      return { x, y };
    }
  }

}
