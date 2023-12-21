import { Physics } from "../entitites/physics";
// import { Ship } from "../entitites/ship";
// const physics = new CelestialBody();

// const celestial = new CelestialBody();
// trajectoryWorker.ts
self.addEventListener('message', (event) => {

    console.log(event.data);
    // console.log(physics);
    // console.log(Physics)
    const physics = new Physics();
    // console.log(physics.calculateTrajectory());

    // const { position, acceleration, velocity, otherBodies, window, mass } = event.data;
    // const result = physics.calculateTrajectory({
    //     position,
    //     acceleration,
    //     velocity,
    //     mass,
    // } as Ship,
    // otherBodies,
    // window)
    const result = null;
    // console.log(result);
    postMessage(result);
  });
  
  