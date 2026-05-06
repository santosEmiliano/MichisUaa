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

  const barData = [
    { label: "Ed. 108", value: 88, color: "#E8893C", width: "100%" },
    { label: "Zona alberca", value: 77, color: "#3B82F6", width: "85%" },
    { label: "Ed. 117", value: 64, color: "#2B9E76", width: "70%" },
    { label: "UMD", value: 52, color: "#E05252", width: "60%" },
    { label: "Ed. 114", value: 44, color: "#84A98C", width: "50%" },
    { label: "Ed. 59", value: 22, color: "#6366F1", width: "25%" },
  ];

  return (
    <div className="space-y-6 pt-2 pb-10 overflow-x-hidden">
      {headerTarget && createPortal(headerFilters, headerTarget)}

      {/* Tabs */}
      <div className="border-b border-sidebar-separador">
        <button className="px-6 py-2 bg-black text-white rounded-t-lg font-medium text-sm">
          Métricas
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Horizontal Bars Chart */}
        <div className="bg-gris-oscuro rounded-3xl p-6 shadow-lg border border-sidebar-separador">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white">Avistamientos por colonia</h2>
            <span className="text-secondary text-sm">Últimos 3 meses</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {barData.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 text-sm text-secondary font-medium truncate">{item.label}</span>
                <div className="flex-1 bg-black/40 h-8 rounded-lg overflow-hidden relative">
                  <div 
                    className="h-full flex items-center justify-end pr-3 rounded-lg"
                    style={{ width: item.width, backgroundColor: item.color }}
                  >
                    <span className="text-white font-bold text-sm">{item.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
