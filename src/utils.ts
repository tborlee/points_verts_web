import { APIRecord, Status } from "./types";
import { getDistance } from "geolib";

export const compareWalks = (a: APIRecord, b: APIRecord) => {
  if (
    (a.fields.statut === Status.OK || a.fields.statut === Status.Modified) &&
    (b.fields.statut === Status.OK || b.fields.statut === Status.Modified)
  ) {
    if (a.distance != null && b.distance != null) {
      return a.distance > b.distance ? 1 : -1;
    }
  } else {
    if (
      a.fields.statut === Status.Cancelled &&
      b.fields.statut !== Status.Cancelled
    ) {
      return 1;
    } else if (
      a.fields.statut !== Status.Cancelled &&
      b.fields.statut === Status.Cancelled
    ) {
      return -1;
    } else {
      if (a.distance != null && b.distance != null) {
        return a.distance > b.distance ? 1 : -1;
      }
      return 0;
    }
  }
  return 0;
};

export const retrieveDateFromQuery = (): Date | null => {
  const query = new URLSearchParams(window.location.search);
  const dateQuery = query.get("date");
  if (dateQuery !== null) {
    const potentialDate = Date.parse(dateQuery);
    if (!isNaN(potentialDate)) {
      return new Date(potentialDate);
    }
  }
  return null;
};

export async function calculateDistances(
  position: GeolocationPosition,
  data: APIRecord[]
) {
  for (let i = 0; i < data.length; i++) {
    const walk = data[i];
    const rawDistance = getDistance(
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
      { latitude: walk.fields.latitude, longitude: walk.fields.longitude }
    );
    walk.distance = Math.round(rawDistance / 1000);
  }
  return data.sort(compareWalks);
}

export function findNextDateIndex(dates: Date[]): number | undefined {
  const fromQuery = retrieveDateFromQuery();
  if (fromQuery !== null) {
    for (let i = 0; i < dates.length; i++) {
      const date = dates[i].getTime();
      if (date === fromQuery.getTime()) {
        return i;
      }
    }
    return undefined;
  }
  const today = Date.now();
  for (let i = 0; i < dates.length; i++) {
    const date = dates[i].getTime();
    if (date > today) {
      return i;
    }
  }
  // for some reasons, all dates are in the past, so use the last date.
  return dates.length - 1;
}

export enum BannerType {
  warning,
  error,
  info,
}