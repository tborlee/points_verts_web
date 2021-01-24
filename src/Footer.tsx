import React from "react";

function Footer() {
  return (
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
  );
}

export default Footer;
