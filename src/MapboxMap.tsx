import React from "react";
import { APIRecord } from "./types";

const mapboxAccessToken = process.env.REACT_APP_MAPBOX_TOKEN;
const mapboxUsername = process.env.REACT_APP_MAPBOX_USERNAME;
const mapStyle: string | undefined = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches
  ? process.env.REACT_APP_MAPBOX_DARK_STYLE
  : process.env.REACT_APP_MAPBOX_LIGHT_STYLE;
const res = window.devicePixelRatio >= 2 ? "@2x" : "";

const MapboxMap = (walk: APIRecord) => {
  const position = `${walk.fields.longitude},${walk.fields.latitude}`;
  return (
    <img
      loading="lazy"
      width={150}
      height={150}
      src={`https://api.mapbox.com/styles/v1/${mapboxUsername}/${mapStyle}/static/pin-s(${position})/${position},6,0,0/150x150${res}?access_token=${mapboxAccessToken}`}
      alt={`Carte de ${walk.fields.localite}`}
    />
  );
};

export default MapboxMap;
