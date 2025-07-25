import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./utils/SystemRecovery.ts"; // Importar sistema de recuperación
import "./core/initialization/RealSystemInitializer.ts"; // Inicializar sistema de datos reales

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
