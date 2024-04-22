import { Ship } from "./ship";
import { Planet } from "./planet";
import { Physics } from "./physics";

export class GameEngine {
  ship: Ship;
  otherObjects: Planet[];
  keysPressed: Set<string>;
  speed: number;
  frameRef: number | null;
  thrustIntervalX: number | null;
  thrustIntervalY: number | null;
  positionInterval: number | null;
  cumulative: Planet[];
  referenceBodyLast: Planet[];
    physics: Physics;
    frameCount: number;
    windowCount: number;
    windowMax: number;

  constructor(
    ship: Ship,
    otherObjects: Planet[],
    keysPressed: Set<string>,
    speed: number,
    physics: Physics,
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
      this.frameCount = 0;
      this.windowCount = 0;
      this.windowMax = 0;
      this.cumulative = this.otherObjects
      this.referenceBodyLast = this.otherObjects
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
      this.frameCount++
      if (this.frameCount % 50 === 0) {
        const collision = this.otherObjects.reduce((prev, curr) => {
            const res = this.physics.detectCollision(this.ship, curr);
            if (res) {
                return prev.concat(`${curr.name} `);
            }
            return prev;
        }, '');
        if (collision) {
            alert(`collision detected with ${collision}`);
            return;
        }
        this.frameCount = 0;
      }
    this.setWindowCount(this.speed);
    this.physics.advanceTimeStep({
      ship: this.ship,
      otherBodies: this.otherObjects,
      thrustForce: totalForce,
      timeStep: this.speed,
      callback: ({ newAcceleration, newVelocity, newPosition, otherBodiesState }) => {
        this.cumulative = this.cumulative.map((el) => {
          const foundLast = this.referenceBodyLast.find(({ name }) => name === el.name);
          const foundReference = this.otherObjects.find(({ name }) => name === el.name);
          return {
            ...el,
            position: {
              x: el!.position.x! += (foundReference!.position.x! - foundLast?.position.x!),
              y: el!.position.y! += (foundReference!.position.y! - foundLast?.position.y!),
            }
          } as Planet          
        })
        this.otherObjects = otherBodiesState.map((state) => {
          const body = this.otherObjects.find(({ name }) => name === state.name);
          if (!body) {
            return state;
          }
          body.updatePositionNew(state.position);
          body.velocity = state.velocity;
          body.acceleration = state.acceleration;
          return body;
        });
        this.referenceBodyLast = this.otherObjects.map((el) => {
          const copied = JSON.parse(JSON.stringify(el))
          return {
            ...copied,
            position: {
              x: copied.position.x,
              y: copied.position.y,
            }
          } as Planet          
        })
         //         cumulativeX += currentReferenceBody.value!.position.x! - lastX;        
  //         cumulativeX += currentReferenceBody.value!.position.y! - lastY;
  //         lastX = currentReferenceBody.value!.position.x!;
  //         lastY = currentReferenceBody.value!.position.y!;
 
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
  setWindowCount(value: number, windowMax?: number) {
    if(windowMax) this.windowMax = windowMax;
    if (Number(value) === 0 && !windowMax) this.windowCount = 0;
    if(this.windowCount > this.windowMax) {
      this.windowMax = 0;
      this.windowCount = 0;
      return;
    }
    if(this.windowMax) this.windowCount = this.windowCount + Number(value);
  }

}
