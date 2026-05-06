import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icons from "../components/Icons";

const Estadisticas = () => {
  const [colonia, setColonia] = useState("Todas las colonias");
  const [periodo, setPeriodo] = useState("Últimos 3 meses");
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("header-actions");
      if (el) setHeaderTarget(el);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const headerFilters = (
    <div className="flex items-center gap-3">
      <select
        value={colonia}
        onChange={(e) => setColonia(e.target.value)}
        className="appearance-none bg-gris-oscuro border border-sidebar-separador text-secondary rounded-lg px-4 py-2.5 focus:outline-none"
        style={{ colorScheme: "dark" }}
      >
        <option>Todas las colonias</option>
      </select>
      <div className="relative">
        <select
          value={periodo}
          onChange={(e) => setPeriodo(e.target.value)}
          className="appearance-none bg-gris-oscuro border border-sidebar-separador text-secondary rounded-lg px-4 py-2.5 pr-8 focus:outline-none"
          style={{ colorScheme: "dark" }}
        >
          <option>Últimos 3 meses</option>
        </select>
        <Icons.ChevronDown className="absolute right-3 top-3 w-4 h-4 text-secondary pointer-events-none" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 pt-2 pb-10 overflow-x-hidden">
      {headerTarget && createPortal(headerFilters, headerTarget)}
    </div>
  );
};

export default Estadisticas;
