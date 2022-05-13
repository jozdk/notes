import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const title = "Hello React with Webpack and Babel!";

const root = ReactDOM.createRoot(document.querySelector("#root"));
root.render(<App title={title} />)
