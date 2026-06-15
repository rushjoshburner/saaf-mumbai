import booleanPointInPolygon from "@turf/boolean-point-in-polygon";
import { point } from "@turf/helpers";
import type { Feature, Polygon, MultiPolygon } from "geojson";

/**
 * Client-side geo-fence check: is the point inside the BMC boundary?
 *
 * This gives the reporter immediate feedback (e.g. disabling submit if they're
 * outside Mumbai). It is NOT the security gate — the server re-checks every
 * submission via the `is_within_bmc` PostGIS function, which cannot be bypassed.
 *
 * `boundary` is the BMC polygon loaded from /public/data/bmc-boundary.json.
 */
export function isInsideBmc(
  lat: number,
  lng: number,
  boundary: Feature<Polygon | MultiPolygon>,
): boolean {
  // GeoJSON order is [longitude, latitude].
  return booleanPointInPolygon(point([lng, lat]), boundary);
}
