import { useState } from "react";
import { ModalCrud } from "./ModalCrud";
import type { Colonia } from "../types/models";
import { alertService } from "../services/alertService";

export interface ColoniaModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  initial?: Colonia | null;
  onSave: (data: ColoniaFormSave) => Promise<void>;
  users: { id: string; nombre: string }[];
}

export interface ColoniaFormSave {
  id?: number;
  name: string;
  location: string;
  description: string;
  responsableIds: string[];
}

const defaultForm = (): ColoniaFormSave => ({
  name: "",
  location: "",
  description: "",
  responsableIds: [],
});

function formFromProps(
  mode: "create" | "edit",
  initial: Colonia | null | undefined,
): ColoniaFormSave {
  if (mode === "edit" && initial) {
    return {
      name: initial.name,
      location: initial.location,
      description: initial.description,
      responsableIds: initial.responsableIds || [],
    };
  }
  return defaultForm();
}

export const ColoniaModal = ({
  isOpen,
  onClose,
  mode,
  initial,
  onSave,
  users,
}: ColoniaModalProps) => {
  const [form, setForm] = useState<ColoniaFormSave>(() =>
    formFromProps(mode, initial),
  );
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const title = mode === "create" ? "Nueva colonia" : "Editar colonia";

  const footer = (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 w-full sm:justify-end">
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-[#e8893c] hover:bg-[#e8893c]/10 focus:border-[#e8893c] focus:bg-[#e8893c]/10 transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="colonia-form"
        disabled={loading}
        className="w-full sm:w-auto px-6 py-3 sm:py-2.5 rounded-xl border border-[#e8893c] bg-[#e8893c] text-white font-bold hover:brightness-110 shadow-[0_4px_15px_rgba(232,137,60,0.3)] transition-all duration-200 disabled:opacity-50 flex justify-center items-center gap-2"
      >
        {loading && (
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        )}
        {mode === "create" ? "Crear colonia" : "Guardar cambios"}
      </button>
    </div>
  );

  const getInputClass = (field: string) =>
    `w-full bg-gris border rounded-xl px-4 py-3 text-main text-sm focus:outline-none focus:bg-[rgba(232,137,60,0.05)] transition-all duration-200 placeholder-secondary hover:border-acento-naranja ${
      fieldErrors[field] ? "border-red-500 focus:border-red-500" : "border-sidebar-separador focus:border-acento-naranja"
    }`;

  return (
    <ModalCrud isOpen={isOpen} onClose={onClose} title={title} footer={footer}>
      <form
        id="colonia-form"
        className="space-y-4"
        onSubmit={async (e) => {
          e.preventDefault();
          if (form.responsableIds.length === 0) {
            alertService.warning(
              "Debes seleccionar al menos un encargado para la colonia.",
              "Información Incompleta"
            );
            return;
          }
          setLoading(true);
          setFieldErrors({});
          try {
            await onSave({
              ...form,
              ...(mode === "edit" && initial ? { id: initial.id } : {}),
            });
            onClose();
          } catch (err) {
            const msg = err instanceof Error ? err.message : "";
            if (msg.toLowerCase().includes("existe") && msg.toLowerCase().includes("nombre")) {
              setFieldErrors({ name: msg });
            }
          } finally {
            setLoading(false);
          }
        }}
      >
        <div>
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-name"
          >
            Nombre de la Colonia
          </label>
          <input
            id="colonia-name"
            type="text"
            required
            maxLength={100}
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Ej: Campus Norte, Veterinaria..."
            className={getInputClass("name")}
          />
          <div className={`text-xs text-right mt-1 ${form.name.length >= 100 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {form.name.length} / 100
          </div>
          {fieldErrors.name && (
            <p className="text-xs text-red-400 mt-1.5">{fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-location"
          >
            Ubicación / Zona
          </label>
          <input
            id="colonia-location"
            type="text"
            required
            maxLength={150}
            value={form.location}
            onChange={(e) =>
              setForm((f) => ({ ...f, location: e.target.value }))
            }
            placeholder="Ej: Cerca del edificio 42, estacionamiento principal..."
            className={getInputClass("location")}
          />
          <div className={`text-xs text-right mt-1 ${form.location.length >= 150 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {form.location.length} / 150
          </div>
        </div>

        <div>
          <label
            className="block text-main font-bold mb-1.5 text-sm"
            htmlFor="colonia-desc"
          >
            Descripción
          </label>
          <textarea
            id="colonia-desc"
            required
            rows={3}
            maxLength={400}
            value={form.description}
            onChange={(e) =>
              setForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Breve descripción del área y contexto de la colonia."
            className={`${getInputClass("description")} resize-none`}
          />
          <div className={`text-xs text-right mt-1 ${form.description.length >= 400 ? 'text-red-500 font-bold' : 'text-secondary'}`}>
            {form.description.length} / 400
          </div>
        </div>

        <div>
          <label className="block text-main font-bold mb-1.5 text-sm">
            Encargados de Colonia
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
            {users.map((o) => (
              <label key={o.id} className="flex items-center gap-3 cursor-pointer bg-gris border border-sidebar-separador rounded-xl px-4 py-3 hover:border-[#e8893c] transition-colors">
                <input
                  type="checkbox"
                  value={o.id}
                  checked={form.responsableIds.includes(o.id)}
                  onChange={(e) => {
                    const newIds = e.target.checked 
                      ? [...form.responsableIds, o.id]
                      : form.responsableIds.filter(id => id !== o.id);
                    setForm(f => ({ ...f, responsableIds: newIds }));
                  }}
                  className="w-5 h-5 text-[#e8893c] bg-gris border-sidebar-separador rounded focus:ring-[#e8893c] focus:ring-2 focus:ring-offset-2 focus:ring-offset-gris-oscuro"
                />
                <span className="text-[15px] text-main truncate" title={o.nombre}>{o.nombre}</span>
              </label>
            ))}
          </div>
          {form.responsableIds.length === 0 && (
            <p className="text-xs text-red-400 mt-1">Debes seleccionar al menos un encargado.</p>
          )}
        </div>
      </form>
    </ModalCrud>
  );
};
