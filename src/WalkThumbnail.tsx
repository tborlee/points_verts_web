import React from "react";
import { APIRecord } from "./types";

const mapboxAccessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const mapboxUsername = import.meta.env.VITE_MAPBOX_USERNAME;
const mapStyle: string | undefined = window.matchMedia(
  "(prefers-color-scheme: dark)"
).matches
  ? import.meta.env.VITE_MAPBOX_DARK_STYLE
  : import.meta.env.VITE_MAPBOX_LIGHT_STYLE;
const res = window.devicePixelRatio >= 2 ? "@2x" : "";

const WalkThumbnail = (walk: APIRecord) => {
  const position = `${walk.fields.longitude},${walk.fields.latitude}`;
  return (
    <img
      loading="lazy"
      width={150}
      height={150}
      aria-hidden={true}
      src={`https://api.mapbox.com/styles/v1/${mapboxUsername}/${mapStyle}/static/pin-s(${position})/${position},6,0,0/150x150${res}?access_token=${mapboxAccessToken}`}
      alt={`Carte de ${walk.fields.localite}`}
      title={`Carte de ${walk.fields.localite}`}
    />
  );
};

export default WalkThumbnail;
