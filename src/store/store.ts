import { defineStore } from 'pinia';
import { Vector2D } from '../interfaces';
import { Ship } from '../entitites/ship';
import { Planet } from '../entitites/planet';
import { Scenario } from '../interfaces';
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
    ]
  },
  {
    id: 2,
    name: 'Empty Space',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: 0, y: 0 }, 100),
    otherBodies: []
  },
  {
    id: 3,
    name: 'Planet Earth with Sun',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: stationOrbitalVelocity + earthOrbitalVelocity, y: 0 }, 100),
    otherBodies: [
      new Planet({ x: 0, y: distanceFromCenterOfEarth }, earthMass, { x: earthOrbitalVelocity, y: 0 }, earthRadius, 'earth'),
      new Planet({ x: 0, y: -earthToSunDistance }, sunMass, { x: 0, y: 0 }, sunRadius, 'sun'),
    ]
  },
]

const originalScenarios: Scenario[] = JSON.parse(JSON.stringify(initialState));

export const useMainStore = defineStore('main', {
  state: () => ({
    trajectoryData: [] as Vector2D[],
    loading: false,
    error: null,
    pause: false,
    initialState: { ...initialState[2] },
    scenarioOptions: [...initialState],
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
      const originalScenario = originalScenarios.find(scenario => scenario.id === id);
      if (originalScenario) {
        this.initializeScenario(originalScenario);
      }
    },

    resetScenario() {
      const currentScenarioId = this.initialState.id;
      const originalScenario = originalScenarios.find(scenario => scenario.id === currentScenarioId);
      if (originalScenario) {
        this.initializeScenario(originalScenario);
      }
    },
    initializeScenario(scenario: Scenario) {
      const clonedScenario = JSON.parse(JSON.stringify(scenario));
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
    },
});
