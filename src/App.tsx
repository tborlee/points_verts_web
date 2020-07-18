import React, {useEffect, useState} from 'react';
import './App.css';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
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
  fields: APIRecordFields
}

type APIResult = {
  records: APIRecord[];
}

function App() {

  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<APIRecord[]>([]);
  const [dataUnavailable, setDataUnavailable] = useState<boolean>(false);
  const [date, setDate] = useState<Date>();

  useEffect(() => {

    async function fetchDate() {
      return await fetch('https://www.odwb.be/api/records/1.0/search/?dataset=points-verts-de-ladeps&q=date+%3E%3D+2020%2F07%2F18&rows=1&sort=-date')
        .then(response => response.json())
        .then(data => data as APIResult)
        .then(data => new Date(data.records[0].fields.date));
    }

    async function fetchData(date: Date) {
      fetch(`https://www.odwb.be/api/records/1.0/search/?dataset=points-verts-de-ladeps&q=date=${date.toISOString().slice(0, 10)}&rows=30`)
        .then(response => response.json())
        .then(data => data as APIResult)
        .then(data => setData(data.records.sort((a, b) => {
          if (a.fields.statut === Status.Cancelled && b.fields.statut !== Status.Cancelled) {
            return 1;
          } else if (a.fields.statut !== Status.Cancelled && b.fields.statut === Status.Cancelled) {
            return -1;
          } else {
            return 0;
          }
        }))).catch(_ => {
        setDataUnavailable(true);
      });
    }

    fetchDate().then(async date => {
      setDate(date);
      await fetchData(date);
      setLoading(false);
    }).catch(_ => {
      setDataUnavailable(true);
      setLoading(false);
    });
  }, []);

  return (
    <div className="container">
      <div className="text-center m-3">
        {date && <h1>Marches Adeps du {date.toLocaleDateString('fr')}</h1>}
        {!date && <h1>Marches Adeps</h1>}
      </div>
      <div className="alert alert-info"><FontAwesomeIcon icon={faInfoCircle}/>&nbsp;Les données proviennent de la
        plateforme <a href="https://www.odwb.be/explore/dataset/points-verts-de-ladeps/t">ODWB</a> et peuvent ne pas
        correspondre aux données du site officiel.
      </div>
      {dataUnavailable &&
      <div className="alert alert-danger"><FontAwesomeIcon icon={faExclamationCircle}/>&nbsp;Impossible de récupérer les
        données. Rechargez la page pour réessayer.</div>}
      {loading && <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="sr-only">Chargement...</span>
        </div>
      </div>}
      {data.map((walk) => WalkCard(walk))}
    </div>
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

const WalkCard = (walk: APIRecord) => (
  <div key={walk.recordid} className="card mb-4 mt-4">
    <div className="card-header">
      <div className="row">
        <div className="col">
          <span><FontAwesomeIcon
            icon={walk.fields.activite === Activity.walk ? faWalking : faCompass}/>&nbsp;{walk.fields.localite} ({walk.fields.province})</span>
        </div>
        <div className="col-auto">
          <WalkBadge {...walk} />
        </div>
      </div>
    </div>
    <div className="card-body">
      <FontAwesomeIcon icon={faMapMarker}/>&nbsp;Points de départ : <a
      href={`geo:${walk.fields.latitude},${walk.fields.longitude}`}>{walk.fields.lieu_de_rendez_vous}</a>
      {walk.fields.infos_rendez_vous !== undefined && <span> - {walk.fields.infos_rendez_vous}</span>}
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
            <div className="col-1">
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
      <div className="row">
        <div className="col-lg-6">
          Organisé par <i>{walk.fields.groupement}</i>
        </div>
        <div className="col-lg-6 text-right">
          {walk.fields.gsm !== undefined && <a href={`tel:${walk.fields.gsm}`}><FontAwesomeIcon
            icon={faPhone}/>&nbsp;{walk.fields.nom} {walk.fields.prenom}</a>}
        </div>
      </div>
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
        <div className="col-1">
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
