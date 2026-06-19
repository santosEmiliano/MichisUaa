import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icons from "./Icons";

/**
 * Formulario NO controlado: los valores se leen directamente desde
 * el DOM a través de refs en lugar de mantener estado en React.
 * Demuestra el uso de useRef como alternativa a useState para formularios.
 */
const BuscadorGatoPorId = () => {
  // useRef apunta al elemento <input> del DOM — sin re-renders al escribir
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const validar = (valor: string): string | null => {
    if (!valor.trim()) return "El ID no puede estar vacío.";
    if (!/^\d+$/.test(valor.trim())) return "El ID debe ser un número entero positivo.";
    if (Number(valor.trim()) <= 0) return "El ID debe ser mayor a cero.";
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Se lee el valor directamente del DOM a través de la ref
    const valor = inputRef.current?.value ?? "";
    const mensajeError = validar(valor);

    if (mensajeError) {
      setError(mensajeError);
      inputRef.current?.focus();
      return;
    }

    setError(null);
    navigate(`/gatos/${valor.trim()}`);
  };

  return (
    <div className="bg-card border border-panel rounded-xl p-4">
      <p className="text-sm font-semibold text-main mb-3 flex items-center gap-2">
        <Icons.Search className="w-4 h-4 text-[#e8893c]" />
        Buscar gato por ID
      </p>

      <form onSubmit={handleSubmit} noValidate className="flex gap-2 items-start">
        <div className="flex-1 space-y-1">
          {/* Input NO controlado — no tiene value ni onChange */}
          <input
            ref={inputRef}
            type="text"
            placeholder="Ej. 42"
            defaultValue=""
            className="w-full bg-gris-oscuro border border-panel rounded-lg px-4 py-2.5 text-sm text-main placeholder-secondary focus:outline-none focus:border-[#e8893c]/50 transition-colors"
            style={{ caretColor: "var(--accent-orange)" }}
            onChange={() => {
              // Limpiar el error mientras el usuario escribe
              if (error) setError(null);
            }}
          />
          {error && (
            <p className="text-xs text-[var(--badge-rojo-texto)] flex items-center gap-1">
              <Icons.ErrorCircle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </p>
          )}
        </div>
        <button
          type="submit"
          className="flex items-center gap-1.5 bg-gris border border-panel text-main text-sm font-bold py-2.5 px-4 rounded-lg hover:bg-gris-oscuro transition-colors shrink-0"
        >
          <Icons.ArrowRight className="w-4 h-4" />
          Ir
        </button>
      </form>
    </div>
  );
};

export default BuscadorGatoPorId;
