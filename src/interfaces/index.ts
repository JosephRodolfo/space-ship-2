import { Ship } from "../entitites/ship";
import { Planet } from "../entitites/planet";
export interface Vector2D {
    x?: number;
    y?: number;
    index?: number;
}
export interface Scenario {
  id: number,
  name: string,
  ship: Ship,
  otherBodies: Planet[],
  speedSettings: Settings,
  magnificationSettings: MagnificationSettings,
  referenceBody: string,
}

interface MagnificationSettings {
  map: Settings,
  miniMap: Settings
}
interface Settings {
  min: number,
  max: number,
  default?: number,
}

