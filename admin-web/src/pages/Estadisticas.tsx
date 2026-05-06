import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { PieChart, Pie, Cell, AreaChart, Area, ResponsiveContainer } from "recharts";
import Icons from "../components/Icons";
import { MetricCard } from "../components/MetricCard";
import { LoadingScreen } from "../components/LoadingScreen";

const Estadisticas = () => {
  const [colonia, setColonia] = useState("Todas las colonias");
  const [periodo, setPeriodo] = useState("Últimos 3 meses");
  const [headerTarget, setHeaderTarget] = useState<HTMLElement | null>(null);

  // Información de estadísticas
  const [totalGatos, setTotalGatos] = useState(0);
  const [esterilizados, setEsterilizados] = useState(0);
  const [desapariciones, setDesapariciones] = useState(0);
  const [avistamientosSemana, setAvistamientosSemana] = useState(0);
  const [sterilizedState, setSterilizedState] = useState<{ name: string; value: number; color: string }[]>([]);

  // Información de gráficas
  const BAR_COLORS = ["#E8893C", "#3B82F6", "#2B9E76", "#E05252", "#84A98C", "#6366F1"];
  const [barData, setBarData] = useState<{ colonia: string; total: number; color: string; width: string }[]>([]);
  const [sighingsTendencyData, setSighingsTendencyData] = useState<{ name: string; value: number }[]>([]);
  const [coloniesSummaryData, setColoniesSummaryData] = useState<{ nombreColonia: string; totalGatos: number; porcentajeEsterilizados: number; }[]>([]);

  const [animatedBarWidths, setAnimatedBarWidths] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const el = document.getElementById("header-actions");
      if (el) setHeaderTarget(el);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (barData.length === 0) return;
    // Inicializa las barras en 0%
    setAnimatedBarWidths(barData.map(() => "0%"));
  
    const timers = barData.map((item, index) => {
      return setTimeout(() => {
        setAnimatedBarWidths((prev) => {
          const newWidths = [...prev];
          newWidths[index] = item.width;
          return newWidths;
        });
      }, index * 150 + 100);
    });

    return () => timers.forEach(clearTimeout);
  }, [barData]);

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

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const headers = { Authorization: `Bearer ${token}` };

      const [resTotalCats, resEsterilizados, resDesapariciones, resAvistamientos, resBarData, resSighingsTendency, resColoniesSummary, resSterilizedState] = await Promise.all([
        fetch("http://localhost:3000/stadistics/totalCats", { headers }),
        fetch("http://localhost:3000/stadistics/sterilizedCount", { headers }),
        fetch("http://localhost:3000/stadistics/missingCats", { headers }),
        fetch("http://localhost:3000/stadistics/sightingsLastWeek", { headers }),
        fetch("http://localhost:3000/stadistics/signingsPerColony", { headers }),
        fetch("http://localhost:3000/stadistics/sighingsTendency", { headers }),
        fetch("http://localhost:3000/stadistics/coloniesSummary", { headers }),
        fetch("http://localhost:3000/stadistics/sterilizedState", { headers }),
      ]);

      if (resTotalCats.ok) setTotalGatos(await resTotalCats.json());
      if (resEsterilizados.ok) setEsterilizados(await resEsterilizados.json());
      if (resDesapariciones.ok) setDesapariciones(await resDesapariciones.json());
      if (resAvistamientos.ok) setAvistamientosSemana(await resAvistamientos.json());
      if (resSighingsTendency.ok) setSighingsTendencyData(await resSighingsTendency.json());
      if (resColoniesSummary.ok) setColoniesSummaryData(await resColoniesSummary.json());
      if (resSterilizedState.ok) setSterilizedState(await resSterilizedState.json());

      if (resBarData.ok) {
        const rawBarData = await resBarData.json();
        const sorted = rawBarData.sort((a: any, b: any) => b.total - a.total);
        const maxVal = sorted.length > 0 ? sorted[0].total : 1;
        const processed = sorted.map((item: any, i: number) => ({
          colonia: item.colonia,
          total: item.total,
          color: BAR_COLORS[i % BAR_COLORS.length],
          width: `${Math.max((item.total / maxVal) * 100, 5)}%`
        }));
        setBarData(processed);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      // Pequeño delay para que la transición no sea brusca
      setTimeout(() => setIsLoading(false), 600);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);


  if (isLoading) {
    return <LoadingScreen message="Cargando Estadísticas" />;
  }

  return (
    <div className="space-y-6 pt-2 pb-10 overflow-x-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      {headerTarget && createPortal(headerFilters, headerTarget)}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard
          title="Total Gatos"
          value={totalGatos}
          trendText="+3 este mes"
          borderColor="#E8893C"
        />
        <MetricCard
          title="Esterilizados"
          value={esterilizados}
          valueSuffix="%"
          trendText="+5% vs anterior"
          borderColor="#2B9E76"
        />
        <MetricCard
          title="Desapariciones"
          value={desapariciones}
          trendText="+1 este mes"
          trendType="danger"
          borderColor="#E05252"
        />
        <MetricCard
          title="Avistamientos por semana"
          value={avistamientosSemana}
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
                <span className="w-24 text-sm text-secondary font-medium truncate">{item.colonia}</span>
                <div className="flex-1 bg-black/40 h-8 rounded-lg overflow-hidden relative">
                  <div 
                    className="h-full flex items-center justify-end pr-3 rounded-lg overflow-hidden whitespace-nowrap"
                    style={{ 
                      width: animatedBarWidths[i] || "0%", 
                      backgroundColor: item.color,
                      transition: "width 1s cubic-bezier(0.16, 1, 0.3, 1)"
                    }}
                  >
                    <span className="text-white font-bold text-sm">{item.total}</span>
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
                    data={sterilizedState}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    stroke="none"
                    dataKey="value"
                  >
                    {sterilizedState.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold text-white">{esterilizados}<span className="text-2xl text-secondary">%</span></span>
                <span className="text-secondary text-sm">esteril</span>
              </div>
            </div>
            
            <div className="flex flex-col gap-3 ml-4">
              {sterilizedState.map((item, i) => (
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
              <AreaChart data={sighingsTendencyData} margin={{ top: 5, right: 10, left: 10, bottom: 20 }}>
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
              {sighingsTendencyData.map((d, i) => (
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
                {coloniesSummaryData.map((row, i) => (
                  <div key={i} className="px-6 py-3 grid grid-cols-3 text-sm text-secondary border-b border-sidebar-separador items-center">
                    <span>{row.nombreColonia}</span>
                    <span>{row.totalGatos}</span>
                    <div className="flex items-center gap-2">
                      <span>{row.porcentajeEsterilizados}</span>
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
                {coloniesSummaryData.map((row, i) => (
                  <div key={i} className="px-6 py-3 grid grid-cols-3 text-sm text-secondary border-b border-sidebar-separador items-center">
                    <span>{row.nombreColonia}</span>
                    <span>{row.totalGatos}</span>
                    <div className="flex items-center gap-2">
                      <span>{row.porcentajeEsterilizados}%</span>
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
