import { defineStore } from 'pinia';
import { Vector2D } from '../interfaces';


export const useMainStore = defineStore('main', {
  state: () => ({
    trajectoryData: [] as Vector2D[],
    loading: false,
    error: null,
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
    },
});
