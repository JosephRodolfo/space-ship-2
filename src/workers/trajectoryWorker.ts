import { Physics } from "../entitites/physics";
import { Ship } from "../entitites/ship";
const physics = new Physics();

  
self.addEventListener('message', (event) => {
  const { otherBodies, window, shipData, timeStep, granularityFactor } = event.data;
  const totalRange = window[1] - window[0];
  const chunkSize = 1000;
  const maxWindow = window[1];
  
  const totalPoints = Math.ceil(totalRange / timeStep);
  
  let desiredPoints = granularityFactor ? Math.ceil(totalPoints / granularityFactor) : 20;
  desiredPoints = Math.min(desiredPoints, totalPoints);
  
  let sampleRate = Math.max(1, Math.floor(totalPoints / desiredPoints));
  
  let currentShipState = { ...shipData };
  let allTrajectoryPoints = [];

  for (let start = window[0]; start < maxWindow; start += chunkSize) {
    const end = Math.min(start + chunkSize, maxWindow);
    const chunkWindow = [start, end];
    const { trajectory: trajectoryChunk, finalShipState } = physics.calculateTrajectory(
      currentShipState as Ship,
      otherBodies,
      chunkWindow as [number, number],
      timeStep,
    );

    currentShipState = finalShipState;
    allTrajectoryPoints.push(...trajectoryChunk);
  }



  let filteredPoints = allTrajectoryPoints.filter((_el, index) => index % sampleRate === 0);
  
  if (filteredPoints[filteredPoints.length - 1] !== allTrajectoryPoints[allTrajectoryPoints.length - 1]) {
    filteredPoints.push(allTrajectoryPoints[allTrajectoryPoints.length - 1]);
  }

  postMessage({
    chunk: filteredPoints,
  });
});






  
  
  