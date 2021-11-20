import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Banner, BannerType } from "./Banner";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons/faArrowRight";
import WalkCard from "./WalkCard";
import Footer from "./Footer";
import Navbar from "./Navbar";
import Map from "./Map";
import { fetchData, fetchDates } from "./api";
import { calculateDistances, compareWalks, findNextDateIndex } from "./utils";
import { APIRecord } from "./types";

function App() {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<APIRecord[]>([]);
  const [dataUnavailable, setDataUnavailable] = useState<boolean>(false);
  const [dates, setDates] = useState<Date[]>([]);
  const [dateIndex, setDateIndex] = useState<number>();
  const [positionUnavailable, setPositionUnavailable] =
    useState<boolean>(false);
  const [position, setPosition] = useState<GeolocationPosition>();
  const [geoPermission, setGeoPermission] = useState<PermissionState>();

  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: "geolocation" }).then((result) => {
        setGeoPermission(result.state);
      });
    }
  });

  useEffect(() => {
    if (!position && geoPermission === "granted") {
      getCurrentPosition();
    }
  }, [position, geoPermission]);

  const getCurrentPosition = () => {
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
  };

  useEffect(() => {
    try {
      fetchDates().then((datesFetched) => {
        setDates(datesFetched);
        const dateIndex = findNextDateIndex(datesFetched);
        if (dateIndex !== undefined) {
          setDateIndex(dateIndex);
        } else {
          setLoading(false);
        }
      });
    } catch (err) {
      console.log(err);
      setDataUnavailable(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (dates.length > 0 && dateIndex !== undefined) {
      try {
        fetchData(dates[dateIndex]).then((dataFetched) => {
          setData(dataFetched.sort(compareWalks));
          setLoading(false);
        });
      } catch (err) {
        console.log(err);
        setDataUnavailable(true);
        setLoading(false);
      }
    }
  }, [dates, dateIndex]);

  useEffect(() => {
    if (data.length !== 0 && position !== undefined) {
      calculateDistances(position, data).then((sorted) => {
        setLoading(true);
        setData(sorted);
        setLoading(false);
      });
    }
  }, [data, position]);

  const requestGeoPermission = () => {
    navigator.geolocation.getCurrentPosition(
      function (positionFetched) {
        setPosition(positionFetched);
        setGeoPermission("granted");
      },
      function (error) {
        if (error.code !== error.PERMISSION_DENIED) {
          setPositionUnavailable(true);
          setGeoPermission("denied");
        }
      }
    );
  };

  return (
    <>
      <Navbar dates={dates} dateIndex={dateIndex} />

      <div className="container" role="main">
        <div className="section">
          {!position && geoPermission === "prompt" && (
            <Banner
              type={BannerType.info}
              text="Pour afficher les distances par rapport à votre emplacement actuel, veuillez autoriser la géolocalisation."
              buttonLabel="Autoriser"
              onButtonClick={requestGeoPermission}
            />
          )}
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
          <Map walks={data} />
          {loading && <progress className="progress mt-5 mb-5" max="100" />}
          {!loading && <>{data.map((walk) => WalkCard(walk))}</>}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default App;
