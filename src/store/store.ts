import { defineStore } from 'pinia';
import { Vector2D } from '../interfaces';
import { Ship } from '../entitites/ship';
import { Planet } from '../entitites/planet';
import { Scenario } from '../interfaces';
import { GameEngine } from '../entitites/GameEngine';
import { Physics } from '../entitites/physics';
const earthRadius = 6_371_000;
const marsRadius = 3.3895e6;
const massStation = 420000;
const distanceFromCenterOfEarth = 6_791_000;
const earthMass = 5.972e+24;
const sunMass = 1.989e30; 
const marsMass = 6.39e+23;
const sunRadius = 695700000; 
const earthToSunDistance = 149.6e9; 
const stationOrbitalVelocity = -7661.011873789845;
const earthOrbitalVelocity = 29_780;
const marsOrbitalVelocity = 24_077;

const marsToSunDistance = 227.9e9;
const initialState: Scenario[] = [
  {
    id: 1,
    name: 'Planet Earth',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: stationOrbitalVelocity, y: 0 }, 100),
    otherBodies: [
      new Planet({ x: 0, y: distanceFromCenterOfEarth }, earthMass, { x: 0, y: 0 }, earthRadius, 'earth'),
    ],
    referenceBody: '',
    speedSettings: {
      min: 1,
      max: 300,
    },
    magnificationSettings: {
      map: {
        min: 1,
        max: 20000,
        default: 6000,
      },
      miniMap: {
        min: 1,
        max: 1000000,
        default: 407143,
      }
    }
  },
  {
    id: 2,
    name: 'Empty Space',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: 0, y: 0 }, 100),
    otherBodies: [],
    speedSettings: {
      min: 1,
      max: 300,
    },
    referenceBody: '',
    magnificationSettings: {
      map: {
        min: 1,
        max: 10000,
        default: 6000,
      },
      miniMap: {
        min: 1,
        max: 1000000,
        default: 407143,
      }
    }
  },
  {
    id: 3,
    name: 'Planet Earth with Sun',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: stationOrbitalVelocity + earthOrbitalVelocity, y: 0 }, 100),
    otherBodies: [
      new Planet({ x: 0, y: distanceFromCenterOfEarth }, earthMass, { x: earthOrbitalVelocity, y: 0 }, earthRadius, 'earth'),
      new Planet({ x: 0, y: -earthToSunDistance }, sunMass, { x: 0, y: 0 }, sunRadius, 'sun'),
    ],
    speedSettings: {
      min: 1,
      max: 5000,
    },
    referenceBody: 'earth',
    magnificationSettings: {
      map: {
        min: 1,
        max: 10000,
        default: 6000,
      },
      miniMap: {
        min: 1,
        max: 1214660006 * 2,
        default: 407143,
      }
    }
  },
  {
    id: 4,
    name: 'Planet Earth with Sun and Mars',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: stationOrbitalVelocity + earthOrbitalVelocity, y: 0 }, 100),
    otherBodies: [
      new Planet({ x: 0, y: distanceFromCenterOfEarth }, earthMass, { x: earthOrbitalVelocity, y: 0 }, earthRadius, 'earth'),
      new Planet({ x: 0, y: marsToSunDistance }, marsMass, { x: marsOrbitalVelocity, y: 0 }, marsRadius, 'mars'),
      new Planet({ x: 0, y: -earthToSunDistance }, sunMass, { x: 0, y: 0 }, sunRadius, 'sun'),
    ],
    speedSettings: {
      min: 1,
      max: 5000,
    },
    referenceBody: 'earth',
    magnificationSettings: {
      map: {
        min: 1,
        max: 10000,
        default: 6000,
      },
      miniMap: {
        min: 1,
        max: 1214660006 * 7,
        default: 407143,
      }
    }
  },
  {
    id: 5,
    name: 'Ship Orbiting Sun',
    ship: new Ship('ship', massStation, { x: 0, y: earthToSunDistance }, { x: earthOrbitalVelocity, y: 0 }, 100),
    otherBodies: [
      new Planet({ x: 0, y: 0 }, sunMass, { x: 0, y: 0 }, sunRadius, 'sun'),
    ],
    speedSettings: {
      min: 1,
      max: 100000,
    },
    referenceBody: '',
    magnificationSettings: {
      map: {
        min: 1,
        max: 10000,
        default: 6000,
      },
      miniMap: {
        min: 1,
        max: 1214660006 * 2,
        default: 407143,
      }
    }
  },
  {
    id: 6,
    name: 'Empty Space (Moving)',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: 20000, y: 0 }, 100),
    otherBodies: [],
    speedSettings: {
      min: 1,
      max: 300,
    },
    referenceBody: '',
    magnificationSettings: {
      map: {
        min: 1,
        max: 10000,
        default: 6000,
      },
      miniMap: {
        min: 1,
        max: 1000000,
        default: 407143,
      }
    }
  },
]

const originalScenarios: Scenario[] = JSON.parse(JSON.stringify(initialState));

export const useMainStore = defineStore('main', {
  state: () => ({
    trajectoryData: [] as Vector2D[],
    loading: false,
    error: null,
    pause: false,
    trajectorySettings: {
      // window: 1000,
      window: 5_000_000,
      granularity: 50,
      loadingTrajectory: false,
      totalChunks: 0,
      chunksReceived: 0,
    },
    initialState: null as Scenario|null,
    scenarioOptions: [...initialState],
    referenceBody: null as string|null,
    speed: 1,
    gameEngine: {} as GameEngine,
    controls: new Set() as Set<string>
  }),
  actions: {
    setTrajectoryData(data: Vector2D[]) {
      this.trajectoryData = data;
    },
    setLoading(data: any) {
        this.loading = data;
    },
    setError(data: any) {
        this.error = data;
    },
    setPause() {
      if (this.gameEngine.speed === 0) {
        this.setSpeed(this.speed);
      } else {
        this.speed = this.gameEngine.speed;
        this.setSpeed(0);
      }
    },
    setScenario(id: number) {
      if (id) {
        this.initializeScenario(id);
      }
    },
    setTrajectorySettings({ window, granularity, chunksReceived, totalChunks, loadingTrajectory }: { loadingTrajectory?: boolean; window?: number; granularity?: number; chunksReceived?: number; totalChunks?: number }) {
      if(typeof loadingTrajectory === 'boolean') this.trajectorySettings.loadingTrajectory = loadingTrajectory;
      if(window || window === 0) this.trajectorySettings.window = window;
      if(granularity || granularity === 0) this.trajectorySettings.granularity = granularity;
      if(chunksReceived || chunksReceived === 0) this.trajectorySettings.chunksReceived = chunksReceived;
      if(totalChunks || totalChunks === 0) this.trajectorySettings.totalChunks = totalChunks;

   },
    setSpeed(value: number) {
      this.gameEngine.speed = value;
    },
    resetScenario() {
      this.gameEngine.stop();
      const currentScenarioId = this.initialState?.id;
      const originalScenario = originalScenarios.find(scenario => scenario.id === currentScenarioId);
      if (originalScenario) {
        this.initializeScenario(currentScenarioId!);
      }
    },
    initializeScenario(id: number) {
      if(this.gameEngine && this.gameEngine.ship) this.gameEngine.stop();
      const scenario = this.scenarioOptions.find((el) => el.id === id);
      const clonedScenario = JSON.parse(JSON.stringify(scenario));
      this.setReferenceBody(clonedScenario.referenceBody);
      this.initialState = {
        ...clonedScenario,
        ship: new Ship(
          clonedScenario.ship.name,
          clonedScenario.ship.mass,
          clonedScenario.ship.position,
          clonedScenario.ship.velocity,
          clonedScenario.ship.radius
        ),
        otherBodies: clonedScenario.otherBodies.map((body: Planet) => 
          new Planet(body.position, body.mass, body.velocity, body.radius, body.name)
        )
      };

      this.gameEngine = new GameEngine(this.initialState!.ship!, this.initialState!.otherBodies, this.controls, this.speed, new Physics());
      this.gameEngine.start();
    },
    setReferenceBody(value: string) {
      this.referenceBody = value;
    },
    setControls(keysPressed: Set<string>) {
      this.controls = keysPressed;
    }
    },
});
