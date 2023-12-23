import { Ship } from "../entitites/ship";
import { Planet } from "../entitites/planet";
export interface Vector2D {
    x?: number;
    y?: number;
}
export interface Scenario {
  id: number;
  name: string;
  ship: Ship;
  otherBodies: Planet[];
}
