import { Coordinates } from './locationUtilis';

export const getDistanceInMeters = (
  loc1: Coordinates,
  loc2: Coordinates
): number => {
  const R = 6371e3; // Radius of Earth in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(loc2.lat - loc1.lat);
  const dLon = toRad(loc2.lng - loc1.lng);
  const lat1Rad = toRad(loc1.lat);
  const lat2Rad = toRad(loc2.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const isWithinRadius = (
  userLoc: Coordinates,
  branchLoc: Coordinates,
  radiusMeters = 100
): boolean => {
  const distance = getDistanceInMeters(userLoc, branchLoc);
  return distance <= radiusMeters;
};
