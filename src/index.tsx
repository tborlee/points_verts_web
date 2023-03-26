import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import "bulma/css/bulma.min.css";
import "bulma-prefers-dark/css/bulma-prefers-dark.min.css";

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
