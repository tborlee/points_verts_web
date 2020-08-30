import React from "react";
import {APIRecord} from "./App";

const mapStyle: string = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-v10' : 'light-v10';
const res = window.devicePixelRatio >= 2 ? '@2x' : '';

const MapboxMap = (walk: APIRecord) => {
  return (
    <img
      loading="lazy"
      width={150}
      height={150}
      src={`https://api.mapbox.com/styles/v1/mapbox/${mapStyle}/static/pin-s(${walk.fields.longitude},${walk.fields.latitude})/${walk.fields.longitude},${walk.fields.latitude},7,0,0/150x150${res}?access_token=${process.env.REACT_APP_MAPBOX_TOKEN}`}
      alt={`Carte de ${walk.fields.localite}`}/>
  )
}

export default MapboxMap;
