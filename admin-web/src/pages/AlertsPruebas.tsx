import { useState } from "react";
import { alertService, type AlertPosition } from "../services/alertService";
import Icons from "../components/Icons";

const TestAlertsPage = () => {
  
  //donde aparece la alert
  const [position, setPosition] = useState<AlertPosition>("bottom-right");

  const handleShowAlert = (
    type: "success" | "error" | "warning" | "question",
    title: string,
    message: string
  ) => {
    switch (type) {
      case "success": alertService.success(message, title, position); break;
      case "error": alertService.error(message, title, position); break;
      case "warning": alertService.warning(message, title, position); break;
      case "question": 
        alertService.question(
          message, 
          () => alertService.success("¡Acción confirmada!"), 
          title, 
          () => alertService.error("Acción cancelada"), 
          position
        ); 
        break;
    }
  };

  return (
    <div className="space-y-8 pt-4 h-full">
      {/* Cabecera */}
      <div>
        <h1 className="text-4xl font-extrabold text-main">Laboratorio de Alertas</h1>
        <p className="text-secondary mt-2">
          Página de pruebas para el sistema de notificaciones globales.
        </p>
      </div>

      {/* Contenedor principal */}
      <div className="bg-panel rounded-2xl border border-sidebar-separador p-8 max-w-3xl">
        
        {/* Selector de posición */}
        <div className="mb-10 border-b border-sidebar-separador pb-8">
          <label className="block text-main font-bold mb-3">
            1. Elige la posición en pantalla
          </label>
          <div className="relative w-full sm:w-72">
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value as AlertPosition)}
              className="appearance-none w-full bg-gris border border-sidebar-separador text-main rounded-xl px-4 py-3.5 pr-10 focus:outline-none focus:border-acento-naranja focus:ring-1 focus:ring-acento-naranja hover:border-secondary transition-all duration-200 cursor-pointer"
            >
              <option className="bg-gris-oscuro text-main" value="top-right">↗️ Arriba - Derecha</option>
              <option className="bg-gris-oscuro text-main" value="top-center">⬆️ Arriba - Centro</option>
              <option className="bg-gris-oscuro text-main" value="top-left">↖️ Arriba - Izquierda</option>
              <option className="bg-gris-oscuro text-main" value="center">⏺️ Centro Absoluto</option>
              <option className="bg-gris-oscuro text-main" value="bottom-right">↘️ Abajo - Derecha</option>
              <option className="bg-gris-oscuro text-main" value="bottom-center">⬇️ Abajo - Centro</option>
              <option className="bg-gris-oscuro text-main" value="bottom-left">↙️ Abajo - Izquierda</option>
            </select>
            <Icons.ChevronDown className="absolute right-4 top-4 w-5 h-5 text-secondary pointer-events-none" />
          </div>
        </div>

        {/* Botones de disparo */}
        <div>
          <label className="block text-main font-bold mb-4">
            2. Dispara una alerta
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Botón Success */}
            <button
              onClick={() => handleShowAlert("success", "¡Gato registrado!", "El michi 'Manchas' ha sido guardado con éxito.")}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-[#4ade80] hover:bg-[rgba(74,222,128,0.1)] focus:outline-none focus:ring-2 focus:ring-[#4ade80] transition-all duration-200"
            >
              <Icons.CheckCircle className="w-6 h-6 text-[#4ade80]" />
              Probar Success
            </button>

            {/* Botón Error */}
            <button
              onClick={() => handleShowAlert("error", "Error al eliminar", "No puedes eliminar una colonia que tiene gatos registrados.")}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-[#f87171] hover:bg-[rgba(248,113,113,0.1)] focus:outline-none focus:ring-2 focus:ring-[#f87171] transition-all duration-200"
            >
              <Icons.ErrorCircle className="w-6 h-6 text-[#f87171]" />
              Probar Error
            </button>

            {/* Botón Warning */}
            <button
              onClick={() => handleShowAlert("warning", "Revisa los campos", "El correo institucional parece no tener el formato correcto.")}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-[#fbbf24] hover:bg-[rgba(251,191,36,0.1)] focus:outline-none focus:ring-2 focus:ring-[#fbbf24] transition-all duration-200"
            >
              <Icons.WarningTriangle className="w-6 h-6 text-[#fbbf24]" />
              Probar Warning
            </button>

            {/* Botón Question */}
            <button
              onClick={() => handleShowAlert("question", "¿Deseas continuar?", "Se exportarán más de 500 registros a formato PDF.")}
              className="flex items-center gap-3 px-6 py-4 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-[#60a5fa] hover:bg-[rgba(96,165,250,0.1)] focus:outline-none focus:ring-2 focus:ring-[#60a5fa] transition-all duration-200"
            >
              <Icons.QuestionCircle className="w-6 h-6 text-[#60a5fa]" />
              Probar Question
            </button>

          </div>
        </div>
        
      </div>
    </div>
  );
};

export default TestAlertsPage;