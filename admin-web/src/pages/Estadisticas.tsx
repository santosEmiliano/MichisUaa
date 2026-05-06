import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from "recharts";
import Icons from "../components/Icons";
import { MetricCard } from "../components/MetricCard";

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

  const donutData = [
    { name: "Esterilizados", value: 78, color: "#2B9E76" },
    { name: "Sin esterilizar", value: 15, color: "#E8893C" },
    { name: "Desaparecidos", value: 7, color: "#E05252" },
  ];

  const lineData = [
    { name: "Sem 1", value: 10 },
    { name: "Sem 2", value: 15 },
    { name: "Sem 3", value: 18 },
    { name: "Sem 4", value: 25 },
    { name: "Sem 5", value: 28 },
    { name: "Sem 6", value: 29 },
    { name: "Sem 7", value: 35 },
    { name: "Sem 8", value: 42 },
    { name: "Sem 9", value: 50 },
  ];

  const tableData1 = [
    { col: "Ed. 108", gatos: 12, est: "83%", status: "#2B9E76" },
    { col: "Zona alberca", gatos: 8, est: "75%", status: "#2B9E76" },
    { col: "Ed. 117", gatos: 9, est: "89%", status: "#2B9E76" },
    { col: "UMD", gatos: 6, est: "50%", status: "#E8893C" },
    { col: "Ed. 114", gatos: 5, est: "40%", status: "#E8893C" },
  ];

  const tableData2 = [
    { col: "Ed. 59", gatos: 4, est: "10%", status: "#E05252" },
  ];

  return (
    <div className="space-y-6 pt-2 pb-10 overflow-x-hidden">
      {headerTarget && createPortal(headerFilters, headerTarget)}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Gatos"
          value={47}
          trendText="+3 este mes"
          borderColor="#E8893C"
        />
        <MetricCard
          title="Esterilizados"
          value={78}
          valueSuffix="%"
          trendText="+5% vs anterior"
          borderColor="#2B9E76"
        />
        <MetricCard
          title="Desapariciones"
          value={2}
          trendText="+1 este mes"
          trendType="danger"
          borderColor="#E05252"
        />
        <MetricCard
          title="Avistamientos por semana"
          value={24}
          trendText="+8 vs anterior"
          borderColor="#3B82F6"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-6">
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

        <div className="bg-gris-oscuro rounded-3xl p-6 shadow-lg border-t-2 border-t-[#E8893C] border-x border-b border-sidebar-separador">
          <h2 className="text-xl font-bold text-white mb-6">Estado de esterilización</h2>
          <div className="flex items-center">
            <div className="w-48 h-48 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    stroke="none"
                    dataKey="value"
                  >
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">78%</span>
                <span className="text-secondary text-sm">esteril</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 ml-4">
              {donutData.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-secondary text-sm font-medium">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-gris-oscuro rounded-3xl p-6 shadow-lg border-t-2 border-t-[#3B82F6] border-x border-b border-sidebar-separador flex flex-col">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-xl font-bold text-white">Tendencia de avistamientos</h2>
            <span className="text-secondary text-sm">Por semana</span>
          </div>
          
          <div className="flex-1 min-h-[200px] w-full mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lineData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8893C" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#E8893C" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#E8893C" 
                  strokeWidth={2} 
                  fillOpacity={1}
                  fill="url(#colorValue)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>

            <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4">
              {lineData.map((d, i) => (
                <div key={i} className="text-[10px] text-secondary flex flex-col items-center">
                  <span>Sem</span>
                  <span>{i+1}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-gris-oscuro rounded-3xl p-0 shadow-lg border-t-2 border-t-[#8B5CF6] border-x border-b border-sidebar-separador overflow-hidden">
          <div className="p-6 pb-4">
            <h2 className="text-xl font-bold text-white">Resumen por colonia</h2>
          </div>
          
          <div className="flex">
            {/* Left Table */}
            <div className="flex-1">
              <div className="bg-[#444] px-6 py-2 grid grid-cols-3 text-xs font-bold text-sidebar-secundario">
                <span>Colonia</span>
                <span>Gatos</span>
                <span>Esteriles</span>
              </div>
              <div className="flex flex-col">
                {tableData1.map((row, i) => (
                  <div key={i} className="px-6 py-3 grid grid-cols-3 text-sm text-secondary border-b border-sidebar-separador items-center">
                    <span>{row.col}</span>
                    <span>{row.gatos}</span>
                    <div className="flex items-center gap-2">
                      <span>{row.est}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.status }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Table */}
            <div className="flex-1 border-l border-sidebar-separador">
              <div className="bg-[#444] px-6 py-2 grid grid-cols-3 text-xs font-bold text-sidebar-secundario">
                <span>Colonia</span>
                <span>Gatos</span>
                <span>Esteriles</span>
              </div>
              <div className="flex flex-col">
                {tableData2.map((row, i) => (
                  <div key={i} className="px-6 py-3 grid grid-cols-3 text-sm text-secondary border-b border-sidebar-separador items-center">
                    <span>{row.col}</span>
                    <span>{row.gatos}</span>
                    <div className="flex items-center gap-2">
                      <span>{row.est}</span>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.status }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
