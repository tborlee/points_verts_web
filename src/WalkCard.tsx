import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWalking } from "@fortawesome/free-solid-svg-icons/faWalking";
import { faCompass } from "@fortawesome/free-solid-svg-icons/faCompass";
import WalkThumbnail from "./WalkThumbnail";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons/faMapMarker";
import { faWheelchair } from "@fortawesome/free-solid-svg-icons/faWheelchair";
import { faBabyCarriage } from "@fortawesome/free-solid-svg-icons/faBabyCarriage";
import { faBinoculars } from "@fortawesome/free-solid-svg-icons/faBinoculars";
import { faBiking } from "@fortawesome/free-solid-svg-icons/faBiking";
import { faWater } from "@fortawesome/free-solid-svg-icons/faWater";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faTrain } from "@fortawesome/free-solid-svg-icons/faTrain";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React from "react";
import { Activity, APIRecord, OuiNon, Status } from "./types";

const WalkCard = (walk: APIRecord) => (
  <div
    id={`walk-${walk.fields.id}`}
    key={walk.recordid}
    className="card mb-4 mt-4"
  >
    <div className="card-header">
      <div className="card-header-title">
        <span className="icon">
          <FontAwesomeIcon
            icon={
              walk.fields.activite === Activity.walk ? faWalking : faCompass
            }
            fixedWidth={true}
          />
        </span>
        <span>
          {walk.fields.localite}{" "}
          <span className="is-hidden-mobile">({walk.fields.province})</span>
        </span>
      </div>
      <div className="card-header-icon">
        <WalkBadge {...walk} />
      </div>
    </div>
    <div className="card-content">
      <div className="columns">
        <div className="column is-narrow has-text-centered">
          <WalkThumbnail {...walk} />
        </div>
        <div className="column">
          <div className="columns is-mobile">
            <div className="column is-narrow">
              <FontAwesomeIcon icon={faMapMarker} fixedWidth={true} />
            </div>
            <div className="column">
              <a href={`geo:${walk.fields.latitude},${walk.fields.longitude}`}>
                {walk.fields.lieu_de_rendez_vous}
              </a>
              <span>
                {" "}
                <WalkDistance {...walk} />
              </span>
              {walk.fields.infos_rendez_vous !== undefined && (
                <span> - {walk.fields.infos_rendez_vous}</span>
              )}
            </div>
          </div>
          <div className="columns is-multiline">
            <WalkInfo
              info={walk.fields["15km"]}
              icon={faWalking}
              description="Parcours supplémentaire de 15 km"
            />
            <WalkInfo
              info={walk.fields.pmr}
              icon={faWheelchair}
              description="Parcours de 5km accessible aux PMRs et aux landaus"
            />
            <WalkInfo
              info={walk.fields.poussettes}
              icon={faBabyCarriage}
              description="Parcours de 5km accessible aux landaus"
            />
            <WalkInfo
              info={walk.fields.orientiation}
              icon={faCompass}
              description="Parcours supplémentaire d'orientation de +/- 8km Cartes I.G.N"
            />
            <WalkInfo
              info={walk.fields.balade_guidee}
              icon={faBinoculars}
              description="Balade guidée Nature"
            />
            <WalkInfo
              info={walk.fields["10km"]}
              icon={faWalking}
              description="Parcours supplémentaire de marche de +/- 10km"
            />
            <WalkInfo
              info={walk.fields.velo}
              icon={faBiking}
              description="Parcours supplémentaire de vélo de +/- 20km"
            />
            <WalkInfo
              info={walk.fields.vtt}
              icon={faBiking}
              description="Parcours supplémentaire de vélo tout-terrain"
            />
            <WalkInfo
              info={walk.fields.ravitaillement}
              icon={faWater}
              description="Ravitaillement"
            />
            <WalkInfo
              info={walk.fields.bewapp}
              icon={faTrash}
              description="Wallonie Plus Propre"
            />
            {walk.fields.gare !== undefined && (
              <div className="column">
                <div className="columns is-mobile">
                  <div className="column is-narrow">
                    <FontAwesomeIcon icon={faTrain} fixedWidth={true} />
                  </div>
                  <div className="column">{walk.fields.gare}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <div className="card-footer">
      <div className="card-footer-item">
        <span>
          Organisé par <i>{walk.fields.groupement}</i>
        </span>
      </div>
    </div>
  </div>
);

type WalkInfoProps = {
  info: OuiNon;
  icon: IconDefinition;
  description: string;
};

const WalkInfo = (props: WalkInfoProps) => {
  if (props.info === OuiNon.true) {
    return (
      <div className="column is-6">
        <div className="columns is-mobile">
          <div className="column is-narrow">
            <FontAwesomeIcon icon={props.icon} fixedWidth={true} />
          </div>
          <div className="column">{props.description}</div>
        </div>
      </div>
    );
  } else {
    return null;
  }
};

const WalkDistance = (walk: APIRecord) => {
  if (walk.distance != null) {
    return <span className="badge badge-primary">(à ~{walk.distance} km)</span>;
  } else {
    return null;
  }
};

const WalkBadge = (walk: APIRecord) => {
  if (walk.fields.statut === Status.OK) {
    return (
      <span
        className="tag is-success has-text-black"
        title="Correspond au calendrier papier"
      >
        {walk.fields.statut}
      </span>
    );
  } else if (walk.fields.statut === Status.Modified) {
    return (
      <span
        className="tag is-warning has-text-black"
        title="Modifié par rapport au calendrier papier"
      >
        {walk.fields.statut}
      </span>
    );
  } else if (walk.fields.statut === Status.Cancelled) {
    return (
      <span
        className="tag is-danger has-text-black"
        title="Ce Point Vert est annulé !"
      >
        {walk.fields.statut}
      </span>
    );
  } else {
    return null;
  }
};

export default WalkCard;
