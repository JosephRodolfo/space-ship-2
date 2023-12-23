import { defineStore } from 'pinia';
import { Vector2D } from '../interfaces';
import { Ship } from '../entitites/ship';
import { Planet } from '../entitites/planet';
const earthRadius = 6_371_000;
const massStation = 420000;
const distanceFromCenterOfEarth = 6_791_000;
const earthMass = 5.972e+24;

const initialState = [
  {
    id: 1,
    name: 'Planet Earth',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: -7661.011873789845, y: 0 }, 100),
    otherBodies: [
      new Planet({ x: 0, y: distanceFromCenterOfEarth }, earthMass, { x: 0, y: 0 }, earthRadius, 'earth'),
    ]
  },
  {
    id: 1,
    name: 'Empty Space',
    ship: new Ship('ship', massStation, { x: 0, y: 0 }, { x: 0, y: 0 }, 100),
    otherBodies: []
  }
]


export const useMainStore = defineStore('main', {
  state: () => ({
    trajectoryData: [] as Vector2D[],
    loading: false,
    error: null,
    pause: false,
    initialState: initialState[0],
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
    }
    },
});
