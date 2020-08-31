import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getDistance } from "geolib";
import { faWalking } from "@fortawesome/free-solid-svg-icons/faWalking";
import { faCompass } from "@fortawesome/free-solid-svg-icons/faCompass";
import { faBabyCarriage } from "@fortawesome/free-solid-svg-icons/faBabyCarriage";
import { faBinoculars } from "@fortawesome/free-solid-svg-icons/faBinoculars";
import { faBiking } from "@fortawesome/free-solid-svg-icons/faBiking";
import { faWater } from "@fortawesome/free-solid-svg-icons/faWater";
import { faTrash } from "@fortawesome/free-solid-svg-icons/faTrash";
import { faTrain } from "@fortawesome/free-solid-svg-icons/faTrain";
import { faWheelchair } from "@fortawesome/free-solid-svg-icons/faWheelchair";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import { faMapMarker } from "@fortawesome/free-solid-svg-icons/faMapMarker";
import { faAndroid } from "@fortawesome/free-brands-svg-icons/faAndroid";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";
import MapboxMap from "./MapboxMap";
import { Banner, BannerType } from "./Banner";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";

enum OuiNon {
  true = "Oui",
  false = "Non",
}

enum Activity {
  walk = "Marche",
  orientation = "Orientation",
}

enum Status {
  OK = "OK",
  Modified = "Modifié",
  Cancelled = "Annulé",
}

enum Province {
  BrabantWallon = "Brabant Wallon",
  HainautEst = "Hainaut Est",
  HainautOuest = "Hainaut Ouest",
  Liege = "Liège",
  Luxembourg = "Luxembourg",
  Namur = "Namur",
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
  "15km": OuiNon;
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
  "10km": OuiNon;
  gsm: string;
};

type APIDate = {
  x: { year: number; month: number; day: number };
  walk_count: number;
};

export type APIRecord = {
  datasetid: string;
  recordid: string;
  distance?: number;
  fields: APIRecordFields;
};

const compareWalks = (a: APIRecord, b: APIRecord) => {
  if (a.fields.statut === b.fields.statut) {
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
      return 0;
    }
  }
  return 0;
};

const retrieveDateFromQuery = (): Date | null => {
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

async function fetchData(date: Date): Promise<APIRecord[]> {
  const response = await fetch(
    `https://www.odwb.be/api/records/1.0/search/?dataset=points-verts-de-ladeps&q=date=${date
      .toISOString()
      .slice(0, 10)}&rows=30`
  );
  const json = await response.json();
  return json.records;
}

async function fetchDates(): Promise<Date[]> {
  const response = await fetch(
    "https://www.odwb.be/api/records/1.0/analyze/?dataset=points-verts-de-ladeps&x=date&y.walks_count.expr=id&y.walks_count.func=COUNT"
  );
  const json = await response.json();
  return json.map(
    (date: APIDate) =>
      new Date(Date.UTC(date.x.year, date.x.month - 1, date.x.day))
  );
}

async function calculateDistances(position: Position, data: APIRecord[]) {
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
}

function findNextDateIndex(dates: Date[]): number | undefined {
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

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<APIRecord[]>([]);
  const [dataUnavailable, setDataUnavailable] = useState<boolean>(false);
  const [dates, setDates] = useState<Date[]>([]);
  const [dateIndex, setDateIndex] = useState<number>();
  const [positionUnavailable, setPositionUnavailable] = useState<boolean>(
    false
  );
  const [position, setPosition] = useState<Position>();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      function (positionFetched) {
        setPosition(positionFetched);
      },
      function (error) {
        if (error.code !== error.PERMISSION_DENIED) {
          setPositionUnavailable(true);
        }
      }
    );
  }, []);

  useEffect(() => {
    async function init() {
      try {
        const datesFetched = await fetchDates();
        setDates(datesFetched);
        const dateIndex = findNextDateIndex(datesFetched);
        if (dateIndex !== undefined) {
          setDateIndex(dateIndex);
        } else {
          setLoading(false);
        }
      } catch (err) {
        console.log(err);
        setDataUnavailable(true);
        setLoading(false);
      }
    }

    init();
  }, []);

  useEffect(() => {
    async function fetch() {
      try {
        const dataFetched =
          dateIndex !== undefined ? await fetchData(dates[dateIndex]) : [];
        setData(dataFetched.sort(compareWalks));
        setLoading(false);
      } catch (err) {
        console.log(err);
        setDataUnavailable(true);
        setLoading(false);
      }
    }

    if (dates.length > 0 && dateIndex !== undefined) {
      fetch();
    }
  }, [dates, dateIndex]);

  useEffect(() => {
    if (data.length !== 0 && position !== undefined) {
      calculateDistances(position, data).then((_) => {
        setData((d) => d.sort(compareWalks));
      });
    }
  }, [data, position]);

  return (
    <>
      <nav
        className="navbar is-fixed-top has-shadow"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container">
          <div className="navbar-brand">
            <div className="navbar-item">
              <span className="icon">
                <FontAwesomeIcon icon={faWalking} fixedWidth={true} />
              </span>
              {dateIndex && (
                <strong>
                  Marches Adeps du {dates[dateIndex].toLocaleDateString("fr")}
                </strong>
              )}
              {!dateIndex && <strong>Marches Adeps</strong>}
            </div>
          </div>
          <div className="navbar-menu">
            <div className="navbar-end">
              <div className="navbar-item">
                <div className="buttons">
                  <a
                    className="button btn-outline-secondary"
                    href="https://play.google.com/store/apps/details?id=dev.alpagaga.points_verts"
                  >
                    <FontAwesomeIcon icon={faAndroid} fixedWidth={true} />
                  </a>
                  &nbsp;
                  <a
                    className="button btn-outline-secondary"
                    href="https://apps.apple.com/us/app/id1522150367"
                  >
                    <FontAwesomeIcon icon={faApple} fixedWidth={true} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container" role="main">
        <div className="section">
          {positionUnavailable && (
            <Banner
              type={BannerType.warning}
              text="Impossible de récupérer la position pour le moment."
            />
          )}
          {position && (
            <Banner
              type={BannerType.info}
              text="Les distances sont calculées à vol d'oiseau."
            />
          )}
          {dataUnavailable && (
            <Banner
              type={BannerType.error}
              text="Impossible de récupérer les données. Rechargez la page pour réessayer."
            />
          )}
          {!loading && data.length === 0 && (
            <Banner
              type={BannerType.warning}
              text="Aucune marche trouvée pour la date sélectionnée."
            />
          )}
          <div className="columns is-mobile">
            <div className="column">
              <div className="buttons is-left">
                {dateIndex !== undefined && dateIndex - 1 >= 0 && (
                  <button
                    className="button"
                    onClick={() => {
                      setDateIndex(dateIndex - 1);
                      setData([]);
                      setLoading(true);
                    }}
                  >
                    <span className="icon">
                      <FontAwesomeIcon icon={faArrowLeft} />
                    </span>
                    <span>{dates[dateIndex - 1].toLocaleDateString("fr")}</span>
                  </button>
                )}
              </div>
            </div>
            <div className="column">
              <div className="buttons is-right">
                {dateIndex !== undefined && dateIndex + 1 < dates.length && (
                  <button
                    className="button"
                    onClick={() => {
                      setDateIndex(dateIndex + 1);
                      setData([]);
                      setLoading(true);
                    }}
                  >
                    <span>{dates[dateIndex + 1].toLocaleDateString("fr")}</span>
                    <span className="icon">
                      <FontAwesomeIcon icon={faArrowRight} />
                    </span>
                  </button>
                )}
              </div>
            </div>
          </div>
          {loading && <progress className="progress" max="100" />}
          {!loading && data.map((walk) => WalkCard(walk))}
        </div>
      </div>
      <footer className="footer">
        <div className="container">
          <div className="content has-text-centered">
            Origine des données&nbsp;:{" "}
            <a href="https://www.odwb.be/explore/dataset/points-verts-de-ladeps/t">
              ODWB
            </a>
          </div>
          <div className="content has-text-centered">
            Les données fournies sur ce site sont purement informatives et leur
            exactitude dépend de la plateforme utilisée. Nous ne pouvons être
            tenus responsables de la non-organisation des marches.
          </div>
          <div className="content has-text-centered">
            Site conçu à l'aide de <a href="https://reactjs.org/">React</a> et{" "}
            <a href="https://bulma.io/">Bulma</a>.
          </div>
        </div>
      </footer>
    </>
  );
}

const WalkBadge = (walk: APIRecord) => {
  if (walk.fields.statut === Status.OK) {
    return (
      <span className="tag is-info" title="Correspond au calendrier papier">
        {walk.fields.statut}
      </span>
    );
  } else if (walk.fields.statut === Status.Modified) {
    return (
      <span
        className="tag is-warning"
        title="Modifié par rapport au calendrier papier"
      >
        {walk.fields.statut}
      </span>
    );
  } else if (walk.fields.statut === Status.Cancelled) {
    return (
      <span className="tag is-danger" title="Ce Point Vert est annulé !">
        {walk.fields.statut}
      </span>
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

const WalkCard = (walk: APIRecord) => (
  <div key={walk.recordid} className="card mb-4 mt-4">
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
          <MapboxMap {...walk} />
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

export default App;
