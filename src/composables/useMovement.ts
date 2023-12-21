import { Ref, computed, onUnmounted, ref } from "vue";
import { Ship } from "../entitites/ship";
import { Physics } from "../entitites/physics";
const ROTATION_INCREMENT = 1 * (Math.PI / 180);
const physics: Physics = new Physics();

export function useMovement(
  ship: Ship,
  keysPressed: Set<string>,
  otherObjects: Ship[],
  speedRef: Ref<number>
) {
  const thrustIncrement = 0.000001 * 1000000000000;
  const maxThrust = Number.POSITIVE_INFINITY;
  let currentThrustY = 0;
  let currentThrustX = 0;
  let thrustIntervalY: number | null = null;
  let thrustIntervalX: number | null = null;
  let positionInterval: number | null = null;

  const startPositionUpdate = () => {
    if (positionInterval === null) {
      positionInterval = setInterval(() => {
        ship.updatePosition(1);
      }, 1000);
    }
  };

  const applyThrust = (direction: "up" | "down" | "left" | "right") => {
    if (direction === "up" || direction === "down") {
      currentThrustY = Math.min(currentThrustY + thrustIncrement, maxThrust);
      currentThrustX = Math.min(currentThrustY + thrustIncrement, maxThrust);

      const x = currentThrustX * Math.cos(ship.rotationAngle - Math.PI / 2);
      const y = currentThrustY * Math.sin(ship.rotationAngle - Math.PI / 2);
      return { x, y };
    } else {
      currentThrustX = Math.min(currentThrustX + thrustIncrement, maxThrust);
      const thrustValue =
        direction === "left" ? -currentThrustX : currentThrustX;
      ship.applyThrust({ x: thrustValue, y: 0 }, 1);
    }
  };

  const startThrust = (direction: "up" | "down" | "left" | "right") => {
    if (direction === "up" || direction === "down") {
      ship.firingThruster = true;
      if (thrustIntervalY !== null) {
        clearInterval(thrustIntervalY);
      }
      thrustIntervalY = setInterval(() => applyThrust(direction), 500);
    } else {
      if (thrustIntervalX !== null) {
        clearInterval(thrustIntervalX);
      }
      thrustIntervalX = setInterval(() => applyThrust(direction), 500);
    }
  };

  const stopThrust = () => {
    if (thrustIntervalY !== null) {
      clearInterval(thrustIntervalY);
      thrustIntervalY = null;
      currentThrustY = 0;
    }
    if (thrustIntervalX !== null) {
      clearInterval(thrustIntervalX);
      thrustIntervalX = null;
      currentThrustX = 0;
    }
    clearInterval(positionInterval!);
    positionInterval = null;
  };

  const updateShipMovement = computed(() => {
    if (
      (!keysPressed.has("w") &&
        !keysPressed.has("s") &&
        !keysPressed.has("a") &&
        !keysPressed.has("d")) ||
      (keysPressed.has("w") && keysPressed.has("s")) ||
      (keysPressed.has("a") && keysPressed.has("d"))
    ) {
      stopThrust();
      ship.firingThruster = false;
      ship.acceleration = { x: 0, y: 0 };
      startPositionUpdate();
    } else {
      if (positionInterval !== null) {
        clearInterval(positionInterval);
        positionInterval = null;
      }
      if (keysPressed.has("w")) startThrust("up");
      if (keysPressed.has("s")) startThrust("down");
      // if (keysPressed.has('a')) startThrust('left');
      // if (keysPressed.has('d')) startThrust('right');
      if (keysPressed.has("a")) {
        ship.addRotation(-ROTATION_INCREMENT);
      }
      if (keysPressed.has("d")) {
        ship.addRotation(ROTATION_INCREMENT);
      }
    }
  });

  const frameRef = ref<number>();
  const updateLoop = () => {
    const totalForce = { x: 0, y: 0 };
    ship.acceleration = { x: 0, y: 0 };

    if (keysPressed.has("w")) {
      
      const thrusterForce = applyThrust("up");
      totalForce.x += thrusterForce!.x;
      totalForce.y +=thrusterForce!.y;
    }
    if (keysPressed.has("s"))  {
      const thrusterForce = applyThrust("down");
      totalForce.x += thrusterForce!.x;
      totalForce.y +=thrusterForce!.y;

    }
    // if (keysPressed.has('a')) applyThrust('left');
    // if (keysPressed.has('d')) applyThrust('right');
    if (keysPressed.has("a")) {
      ship.addRotation(-ROTATION_INCREMENT);
    }
    if (keysPressed.has("d")) {
      ship.addRotation(ROTATION_INCREMENT);
    }

    otherObjects.forEach((otherShip) => {
      const gravitationalForce = physics.calculateGravitationalForce(
        ship,
        otherShip
      );
      totalForce.x += gravitationalForce.x!;
      totalForce.y += gravitationalForce.y!;
    });
    ship.advanceTimeStep(totalForce, speedRef.value);
    // const newAcceleration = physics.calculateAcceleration({
    //   force: totalForce,
    //   mass: ship.mass
    // })
    // ship.updateAcceleration(newAcceleration);
    // // ship.applyThrust(totalForce, 1);
    // const newVelocity = physics.calculateVelocity({
    //   acceleration: newAcceleration,
    //   initialVelocity: ship.velocity,
    //   timeStep: speedRef.value
    // })
    // ship.updateVelocity(newVelocity);
    // const newPosition = physics.calculatePosition({
    //   position: ship.position,
    //   velocity: ship.velocity,
    //   timeStep: speedRef.value,
    // })
    // ship.updatePositionNew(newPosition);
    setTimeout(() => {
      frameRef.value = requestAnimationFrame(updateLoop);
    });
  };

  frameRef.value = requestAnimationFrame(updateLoop);

  onUnmounted(() => {
    if (frameRef.value) {
      cancelAnimationFrame(frameRef.value);
    }
  });

  return { updateShipMovement };
}
