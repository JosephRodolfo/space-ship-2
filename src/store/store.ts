import { defineStore } from 'pinia';
import { Vector2D } from '../interfaces';
import { Ship } from '../entitites/ship';
import { Planet } from '../entitites/planet';
import { Scenario } from '../interfaces';
import { CelestialBody } from '../entitites/celestialBody';
const earthRadius = 6_371_000;
const massStation = 420000;
const distanceFromCenterOfEarth = 6_791_000;
const earthMass = 5.972e+24;
const sunMass = 1.989e30; 
const sunRadius = 695700000; 
const earthToSunDistance = 149.6e9; 
const stationOrbitalVelocity = -7661.011873789845;
const earthOrbitalVelocity = 29_780;

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
]

const originalScenarios: Scenario[] = JSON.parse(JSON.stringify(initialState));

export const useMainStore = defineStore('main', {
  state: () => ({
    trajectoryData: [] as Vector2D[],
    loading: false,
    error: null,
    pause: false,
    initialState: null as Scenario|null,
    scenarioOptions: [...initialState],
    referenceBody: null as string|null,
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
      this.pause = !this.pause;
    },
    setScenario(id: number) {
      if (id) {
        this.initializeScenario(id);
      }
    },

    resetScenario() {
      const currentScenarioId = this.initialState?.id;
      const originalScenario = originalScenarios.find(scenario => scenario.id === currentScenarioId);
      if (originalScenario) {
        this.initializeScenario(currentScenarioId!);
      }
    },
    initializeScenario(id: number) {
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
    },
    setReferenceBody(value: string) {
      this.referenceBody = value;
    }
    },
});
