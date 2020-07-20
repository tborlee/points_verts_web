import React, {useEffect, useState} from 'react';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {getDistance} from 'geolib';
import {faWalking} from "@fortawesome/free-solid-svg-icons/faWalking";
import {faCompass} from "@fortawesome/free-solid-svg-icons/faCompass";
import {faBabyCarriage} from "@fortawesome/free-solid-svg-icons/faBabyCarriage";
import {faBinoculars} from "@fortawesome/free-solid-svg-icons/faBinoculars";
import {faBiking} from "@fortawesome/free-solid-svg-icons/faBiking";
import {faWater} from "@fortawesome/free-solid-svg-icons/faWater";
import {faTrash} from "@fortawesome/free-solid-svg-icons/faTrash";
import {faTrain} from "@fortawesome/free-solid-svg-icons/faTrain";
import {faWheelchair} from "@fortawesome/free-solid-svg-icons/faWheelchair";
import {faInfoCircle} from "@fortawesome/free-solid-svg-icons/faInfoCircle";
import {faExclamationCircle} from "@fortawesome/free-solid-svg-icons/faExclamationCircle";
import {IconDefinition} from '@fortawesome/fontawesome-svg-core';
import {faPhone} from "@fortawesome/free-solid-svg-icons/faPhone";
import {faMapMarker} from "@fortawesome/free-solid-svg-icons/faMapMarker";

enum OuiNon {
  true = "Oui",
  false = "Non"
}

enum Activity {
  walk = "Marche",
  orientation = "Orientation"
}

enum Status {
  OK = "OK",
  Modified = "Modifié",
  Cancelled = "Annulé"
}

enum Province {
  BrabantWallon = "Brabant Wallon",
  HainautEst = "Hainaut Est",
  HainautOuest = "Hainaut Ouest",
  Liege = "Liège",
  Luxembourg = "Luxembourg",
  Namur = "Namur"
}

type APIRecordFields = {
  velo: OuiNon;
  activite: Activity;
  orientiation: OuiNon;
  pmr: OuiNon;
  ndeg_pv: string;
  ravitaillement: OuiNon;
  gare: string;
  groupement: string;
  balade_guidee: OuiNon;
  entite: string;
  bewapp: OuiNon;
  id: number;
  '15km': OuiNon;
  vtt: OuiNon;
  latitude: string;
  ign: string;
  localite: string;
  province: Province;
  nom: string;
  statut: Status;
  lieu_de_rendez_vous: string;
  poussettes: OuiNon;
  infos_rendez_vous: string;
  date: string;
  prenom: string;
  longitude: string;
  '10km': OuiNon;
  gsm: string;
}

type APIRecord = {
  datasetid: string;
  recordid: string;
  distance?: number;
  fields: APIRecordFields
}

const compareWalks = (a: APIRecord, b: APIRecord) => {
  if (a.fields.statut === b.fields.statut) {
    if (a.distance != null && b.distance != null) {
      return a.distance > b.distance ? 1 : -1;
    }
  } else {
    if (a.fields.statut === Status.Cancelled && b.fields.statut !== Status.Cancelled) {
      return 1;
    } else if (a.fields.statut !== Status.Cancelled && b.fields.statut === Status.Cancelled) {
      return -1;
    } else {
      return 0;
    }
  }
  return 0;
}

async function fetchDate(): Promise<Date> {
  const stored = localStorage.getItem("next_walk_date");
  if (stored === null) {
    localStorage.removeItem("walk_list");
    const response = await fetch(`https://www.odwb.be/api/records/1.0/search/?dataset=points-verts-de-ladeps&q=date+%3E%3D+${new Date().toISOString().slice(0, 10)}&rows=1&sort=-date`);
    const json = await response.json();
    const date = json.records[0].fields.date;
    localStorage.setItem("next_walk_date", date);
    return new Date(date);
  } else {
    const date = new Date(stored);
    const now = new Date();
    now.setUTCHours(0, 0, 0, 0);
    if (date.getTime() < now.getTime()) {
      localStorage.removeItem("next_walk_date");
      return fetchDate();
    } else {
      return new Date(stored);
    }
  }
}

async function fetchData(date: Date): Promise<APIRecord[]> {
  const stored = localStorage.getItem("walk_list");
  const timestampString = localStorage.getItem("walk_list_timestamp");
  const timestamp = timestampString === null ? 0 : parseInt(timestampString);
  if (stored === null || (Date.now() - timestamp > 3600000)) {
    const response = await fetch(`https://www.odwb.be/api/records/1.0/search/?dataset=points-verts-de-ladeps&q=date=${date.toISOString().slice(0, 10)}&rows=30`);
    const json = await response.json();
    localStorage.setItem("walk_list", JSON.stringify(json.records));
    localStorage.setItem("walk_list_timestamp", Date.now().toString());
    return json.records;
  } else {
    return JSON.parse(stored);
  }
}

async function calculateDistances(position: Position, data: APIRecord[]) {
  for (let i = 0; i < data.length; i++) {
    const walk = data[i];
    const rawDistance = getDistance({
      latitude: position.coords.latitude,
      longitude: position.coords.longitude
    }, {latitude: walk.fields.latitude, longitude: walk.fields.longitude});
    walk.distance = Math.round(rawDistance / 1000);
  }
}

function App() {

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<APIRecord[]>([]);
  const [dataUnavailable, setDataUnavailable] = useState<boolean>(false);
  const [date, setDate] = useState<Date>();
  const [positionUnavailable, setPositionUnavailable] = useState<boolean>(false);
  const [position, setPosition] = useState<Position>();

  useEffect(() => {

    async function init() {
      try {
        const dateFetched = await fetchDate();
        setDate(dateFetched);
        const dataFetched = await fetchData(dateFetched);
        setLoading(false);
        setData(dataFetched.sort(compareWalks));
        navigator.geolocation.getCurrentPosition(function (positionFetched) {
          setPosition(positionFetched);
          calculateDistances(positionFetched, dataFetched);
          setData([...dataFetched.sort(compareWalks)]);
        }, function (error) {
          if (error.code !== error.PERMISSION_DENIED) {
            setPositionUnavailable(true);
          }
        });
      } catch (err) {
        setDataUnavailable(true);
        setLoading(false);
      }
    }

    init();
  }, []);

  return (
    <>
      <div className="navbar navbar-light bg-light shadow-sm fixed-top">
        <div className="container d-flex">
          <div className="navbar-brand d-flex align-items-center">
            <FontAwesomeIcon icon={faWalking}/>&nbsp;
            {date && <strong>Marches Adeps du {date.toLocaleDateString('fr')}</strong>}
            {!date && <strong>Marches Adeps</strong>}
          </div>
        </div>
      </div>
      <div className="container" role="main">
        {positionUnavailable &&
        <div className="alert alert-warning"><FontAwesomeIcon icon={faExclamationCircle}/>&nbsp;Impossible de récupérer
          la
          position pour le moment.</div>}
        {position &&
        <div className="alert alert-info"><FontAwesomeIcon icon={faInfoCircle}/>&nbsp;Les distances sont calculées à vol
          d'oiseau.
        </div>}
        {dataUnavailable &&
        <div className="alert alert-danger"><FontAwesomeIcon icon={faExclamationCircle}/>&nbsp;Impossible de récupérer
          les
          données. Rechargez la page pour réessayer.</div>}
        {loading && <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="sr-only">Chargement...</span>
          </div>
        </div>}
        {!loading && data.map((walk) => WalkCard(walk))}
      </div>
      <footer className="footer bg-light">
        <div className="container">
          <span className="text-muted">Origine des données&nbsp;: <a
            href="https://www.odwb.be/explore/dataset/points-verts-de-ladeps/t">ODWB</a></span>
        </div>
      </footer>
    </>
  );
}

const WalkBadge = (walk: APIRecord) => {
  if (walk.fields.statut === Status.OK) {
    return <span className="badge badge-info" title="Correspond au calendrier papier">{walk.fields.statut}</span>;
  } else if (walk.fields.statut === Status.Modified) {
    return <span className="badge badge-warning"
                 title="Modifié par rapport au calendrier papier">{walk.fields.statut}</span>;
  } else if (walk.fields.statut === Status.Cancelled) {
    return <span className="badge badge-danger" title="Ce Point Vert est annulé !">{walk.fields.statut}</span>;
  } else {
    return null;
  }
}

const WalkDistance = (walk: APIRecord) => {
  if (walk.distance != null) {
    return <span className="badge badge-primary" title="Correspond au calendrier papier">À ~{walk.distance} km</span>;
  } else {
    return null;
  }
}

const WalkCard = (walk: APIRecord) => (
  <div key={walk.recordid} className="card mb-4 mt-4">
    <div className="card-header">
      <div className="row">
        <div className="col">
          <span><FontAwesomeIcon
            icon={walk.fields.activite === Activity.walk ? faWalking : faCompass}/>&nbsp;{walk.fields.localite} ({walk.fields.province})</span>
        </div>
        <div className="col-auto">
          <WalkDistance {...walk} />
          &nbsp;
          <WalkBadge {...walk} />
        </div>
      </div>
    </div>
    <div className="card-body">
      <div className="row">
        <div className="col-auto">
          <FontAwesomeIcon icon={faMapMarker}/>
        </div>
        <div className="col">
          <a
            href={`geo:${walk.fields.latitude},${walk.fields.longitude}`}>{walk.fields.lieu_de_rendez_vous}</a>
          {walk.fields.infos_rendez_vous !== undefined && <span> - {walk.fields.infos_rendez_vous}</span>}
        </div>
      </div>
      <hr/>
      <div className="row">
        <WalkInfo info={walk.fields["15km"]} icon={faWalking} description="Parcours supplémentaire de 15 km"/>
        <WalkInfo info={walk.fields.pmr} icon={faWheelchair}
                  description="Parcours de 5km accessible aux PMRs et aux landaus"/>
        <WalkInfo info={walk.fields.poussettes} icon={faBabyCarriage}
                  description="Parcours de 5km accessible aux landaus"/>
        <WalkInfo info={walk.fields.orientiation} icon={faCompass}
                  description="Parcours supplémentaire d'orientation de +/- 8km Cartes I.G.N"/>
        <WalkInfo info={walk.fields.balade_guidee} icon={faBinoculars} description="Balade guidée Nature"/>
        <WalkInfo info={walk.fields["10km"]} icon={faWalking}
                  description="Parcours supplémentaire de marche de +/- 10km"/>
        <WalkInfo info={walk.fields.velo} icon={faBiking} description="Parcours supplémentaire de vélo de +/- 20km"/>
        <WalkInfo info={walk.fields.vtt} icon={faBiking} description="Parcours supplémentaire de vélo tout-terrain"/>
        <WalkInfo info={walk.fields.ravitaillement} icon={faWater} description="Ravitaillement"/>
        <WalkInfo info={walk.fields.bewapp} icon={faTrash} description="Wallonie Plus Propre"/>
        {walk.fields.gare !== undefined &&
        <div className="col-lg-6">
          <div className="row align-items-center">
            <div className="col-auto">
              <FontAwesomeIcon icon={faTrain}/>
            </div>
            <div className="col">
              {walk.fields.gare}
            </div>
          </div>
        </div>}
      </div>
    </div>
    <div className="card-footer">
      Organisé par <i>{walk.fields.groupement}</i>
    </div>
  </div>
);

type WalkInfoProps = {
  info: OuiNon,
  icon: IconDefinition,
  description: string
}

const WalkInfo = (props: WalkInfoProps) => {
  if (props.info === OuiNon.true) {
    return <div className="col-lg-6">
      <div className="row align-items-center">
        <div className="col-auto">
          <FontAwesomeIcon icon={props.icon}/>
        </div>
        <div className="col">
          {props.description}
        </div>
      </div>
    </div>
  } else {
    return null;
  }
};

export default App;
