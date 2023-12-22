import { Physics } from "../entitites/physics";
import { Ship } from "../entitites/ship";
const physics = new Physics();

  
self.addEventListener('message', (event) => {
  const { otherBodies, window, shipData, timeStep } = event.data;
  const chunkSize = 1000;
  const maxWindow = window[1];
  let currentShipState = { ...shipData };

  for (let start = window[0]; start < maxWindow; start += chunkSize + 1) {
    const end = Math.min(start + chunkSize, maxWindow);
    const chunkWindow: any = [start, end];
    const { trajectory: trajectoryChunk, finalShipState } = physics.calculateTrajectory(
      currentShipState as Ship,
      otherBodies,
      chunkWindow,
      timeStep,
    );

    currentShipState = finalShipState;
    postMessage({
      chunk: trajectoryChunk,
    });
  }
});



  
  
  