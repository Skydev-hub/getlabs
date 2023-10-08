import { Position } from 'geojson';

export interface MarketsDef {
  [key: string]: Position
}

/**
 * Defines the epicentre of the various markets served by GL.
 */
export const Markets: MarketsDef = {
  Phoenix: [33.448376, -112.074036]
};
