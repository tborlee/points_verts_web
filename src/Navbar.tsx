import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWalking } from "@fortawesome/free-solid-svg-icons/faWalking";
import { faAndroid } from "@fortawesome/free-brands-svg-icons/faAndroid";
import { faApple } from "@fortawesome/free-brands-svg-icons/faApple";
import React from "react";

interface NavbarProps {
  dates: Date[];
  dateIndex: number | undefined;
}

function Navbar({ dates, dateIndex }: NavbarProps) {
  return (
    <nav
      className="navbar is-fixed-top has-shadow"
      style={{ zIndex: 5000 }}
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
  );
}

export default Navbar;
