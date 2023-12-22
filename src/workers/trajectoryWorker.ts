import { Physics } from "../entitites/physics";
import { Ship } from "../entitites/ship";
const physics = new Physics();

self.addEventListener('message', (event) => {
    const { otherBodies, window, shipData, timeStep } = event.data;
    const { acceleration, position, mass, velocity } = shipData
    const result = physics.calculateTrajectory({
        position,
        acceleration,
        velocity,
        mass,
    } as Ship,
    otherBodies,
        window,
        timeStep,
    )
    // console.log(timeStep);
    postMessage(result);
  });
  
  