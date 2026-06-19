import { Link } from "react-router-dom";
import Icons from "../components/Icons";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-main text-main gap-6 p-6">
      <Icons.Cats className="w-24 h-24 text-secondary opacity-20" />
      <div className="text-center space-y-2">
        <h1 className="text-8xl font-bold text-secondary opacity-40">404</h1>
        <p className="text-2xl font-bold">Página no encontrada</p>
        <p className="text-secondary">
          La ruta que buscas no existe en el sistema.
        </p>
      </div>
      <Link
        to="/"
        className="flex items-center gap-2 bg-gris border border-sidebar-separador text-main font-bold py-2.5 px-6 rounded-xl transition-all duration-200 hover:bg-gris-oscuro hover:border-white/15"
      >
        <Icons.ChevronLeft className="w-4 h-4" />
        Volver al inicio
      </Link>
    </div>
  );
};

export default NotFound;
