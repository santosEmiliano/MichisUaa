import { lazy, Suspense, useState, useEffect, useRef } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoadingScreen } from "./components/LoadingScreen";
import { AlertsContainer } from "./components/Alerts/AlertsContainer";
import { checkSession } from "./utils/auth";
import { alertService } from "./services/alertService";

// Lazy loading: los módulos se cargan solo cuando se navega a esa ruta
const AuthPage = lazy(() => import("./pages/AuthPage"));
const MainLayout = lazy(() => import("./layouts/MainLayout"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Gatos = lazy(() => import("./pages/Gatos"));
const Usuarios = lazy(() => import("./pages/Usuarios"));
const Colonias = lazy(() => import("./pages/Colonias"));
const Avistamientos = lazy(() => import("./pages/Avistamientos"));
const Estadisticas = lazy(() => import("./pages/Estadisticas"));
const GatoDetalle = lazy(() => import("./pages/GatoDetalle"));
const NotFound = lazy(() => import("./pages/NotFound"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => checkSession());
  // Evita que N requests fallidos en paralelo apilen N alertas idénticas
  const sessionExpiredAlertShown = useRef(false);

  useEffect(() => {
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      // Si el token es inválido, expiró o no hay permisos
      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        localStorage.removeItem("isAdmin");
        setIsAuthenticated(false);
        if (!sessionExpiredAlertShown.current) {
          sessionExpiredAlertShown.current = true;
          alertService.warning(
            "Tu sesión ha expirado o no tienes los permisos necesarios. Por favor, inicia sesión de nuevo.",
            "Sesión Expirada"
          );
        }
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

  // Al volver a autenticarse, la próxima expiración de sesión debe poder avisar de nuevo
  useEffect(() => {
    if (isAuthenticated) {
      sessionExpiredAlertShown.current = false;
    }
  }, [isAuthenticated]);

  return (
    <>
      <AlertsContainer />
      {/* Suspense muestra LoadingScreen mientras se descarga el chunk del módulo lazy */}
      <Suspense fallback={<LoadingScreen message="Cargando..." />}>
        <Routes>
          {/* Ruta pública */}
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
            <Route index element={<Dashboard />} />
            <Route path="gatos" element={<Gatos />} />
            <Route path="gatos/:id" element={<GatoDetalle />} />
            <Route path="usuarios" element={<Usuarios />} />
            <Route path="colonias" element={<Colonias />} />
            <Route path="avistamientos" element={<Avistamientos />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            {/* Cualquier ruta desconocida dentro del panel muestra 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
          {/* Ruta 404 global para usuarios no autenticados */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}

export default App;
