import { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./pages/Dashboard";
import Gatos from "./pages/Gatos";
import Usuarios from "./pages/Usuarios";
import Colonias from "./pages/Colonias";
import Avistamientos from "./pages/Avistamientos";
import Estadisticas from "./pages/Estadisticas";
import AlertsPrueba from "./pages/AlertsPruebas";
import { AlertsContainer } from "./components/Alerts/AlertsContainer";

import { checkSession } from "./utils/auth";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkSession());

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      // Si el token es inválido, expiró o no hay permisos
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        setIsAuthenticated(false);
      }
      return response;
    };
    
    const handleLogoutEvent = () => setIsAuthenticated(false);
    window.addEventListener("auth:logout", handleLogoutEvent);

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener("auth:logout", handleLogoutEvent);
    };
  }, []);
  return (
    <>
      <AlertsContainer />
      <Routes>
        {/*Ruta pública */}
        <Route
          path="/login"
          element={
            !isAuthenticated ? (
              <AuthPage onLogin={() => setIsAuthenticated(true)} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/"
          element={isAuthenticated ? <MainLayout /> : <Navigate to="/login" />}
        >
          {/* lo manda al dashboard*/}
          <Route index element={<Dashboard />} />
          {/* rutas del panel, FALTAN AGREGAR LAS PÁGINAS, aqui agregamos las rutas */}
          <Route path="gatos" element={<Gatos />} />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="colonias" element={<Colonias />} />
          <Route path="avistamientos" element={<Avistamientos />} />
          <Route path="estadisticas" element={<Estadisticas />} />
          <Route path="alertas-test" element={<AlertsPrueba />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
