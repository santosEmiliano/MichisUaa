import { useState, useEffect } from "react";
import { ModalCrud } from "./ModalCrud";
import Icons from "./Icons";

interface CatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const GatoModal = ({ isOpen, onClose, onSuccess }: CatModalProps) => {
  const [esterilizado, setEsterilizado] = useState<boolean>(true);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  
  const [nombre, setNombre] = useState("");
  const [coloniaId, setColoniaId] = useState("");
  const [estado, setEstado] = useState("Registrado");
  const [fechaNac, setFechaNac] = useState("");
  const [colonias, setColonias] = useState<{idColonia: number, nombre: string}[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchColonias = async () => {
        try {
          const token = localStorage.getItem("token") || "";
          const res = await fetch("http://localhost:3000/colonies/", {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setColonias(data);
          }
        } catch (error) {
          console.error("Error fetching colonias:", error);
        }
      };
      fetchColonias();
    } else {
      setNombre("");
      setColoniaId("");
      setEstado("Registrado");
      setFechaNac("");
      setEsterilizado(true);
      setImagePreview(null);
      setFile(null);
    }
  }, [isOpen]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !coloniaId) {
      alert("El nombre y la colonia son obligatorios.");
      return;
    }
    
    setLoading(true);
    try {
      const token = localStorage.getItem("token") || "";
      const formData = new FormData();
      formData.append("nombre", nombre);
      formData.append("Colonia_idColonia", coloniaId);
      formData.append("esterilizado", esterilizado.toString());
      formData.append("estado", estado);
      if (fechaNac) formData.append("fecha_nac", fechaNac);
      if (file) formData.append("foto", file);

      const res = await fetch("http://localhost:3000/animal/", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (!res.ok) throw new Error("Error al registrar el gato");
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error registrando gato:", error);
      alert("Hubo un error al registrar el gato.");
    } finally {
      setLoading(false);
    }
  };

  const footer = (
    <div className="flex gap-4 w-full justify-end">
      <button
        type="button"
        onClick={onClose}
        className="px-6 py-2.5 rounded-xl border border-sidebar-separador bg-gris text-main font-bold hover:border-acento-naranja hover:bg-[rgba(232,137,60,0.18)] focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.18)] transition-all duration-200"
      >
        Cancelar
      </button>
      <button
        type="submit"
        form="gato-form"
        disabled={loading}
        className={`px-6 py-2.5 rounded-xl border border-[#e8893c] bg-[var(--bg-active-item)] text-[#e8893c] font-bold hover:bg-[rgba(232,137,60,0.30)] hover:border-acento-naranja transition-all duration-200 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Registrando...' : 'Registrar Gato'}
      </button>
    </div>
  );

  return (
    <ModalCrud
      isOpen={isOpen}
      onClose={onClose}
      title="Nuevo Gato"
      footer={footer}
    >
      <form id="gato-form" className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block text-main font-bold mb-2">
            Nombre del Gato
          </label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Ej. Manchas"
            className="w-full bg-gris border border-sidebar-separador rounded-xl px-4 py-3.5 text-main focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] transition-all duration-200 placeholder-secondary hover:border-acento-naranja"
          />
        </div>

        <div>
          <label className="block text-main font-bold mb-2">
            Foto del Gato
          </label>
          <div className="relative flex flex-col items-center justify-center w-full h-32 bg-gris border-2 border-dashed border-sidebar-separador rounded-xl hover:border-acento-naranja hover:bg-[rgba(232,137,60,0.05)] transition-all duration-200 cursor-pointer group overflow-hidden">
            <input 
              type="file" 
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={handleImageChange}
            />
            {imagePreview ? (
              <img src={imagePreview} alt="Vista previa del gato" className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center justify-center group-hover:text-acento-naranja transition-colors duration-200">
                <Icons.ImagePlus className="w-8 h-8 text-secondary group-hover:text-acento-naranja mb-2 transition-colors duration-200" />
                <span className="text-secondary group-hover:text-acento-naranja text-sm font-medium transition-colors duration-200">Haz clic para subir una imagen</span>
                <span className="text-secondary/70 group-hover:text-acento-naranja/70 text-xs mt-1 transition-colors duration-200">PNG, JPG, GIF hasta 5MB</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="block text-main font-bold">Colonia</label>
          <div className="relative w-56">
            <select
              value={coloniaId}
              onChange={(e) => setColoniaId(e.target.value)}
              className="appearance-none w-full bg-gris border border-sidebar-separador text-secondary rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 cursor-pointer [&>option]:bg-[#30302e] [&>option]:text-white"
              style={{ colorScheme: "dark" }}
            >
              <option value="" disabled>
                Seleccionar colonia
              </option>
              {colonias.map((col) => (
                <option key={col.idColonia} value={col.idColonia}>
                  {col.nombre}
                </option>
              ))}
            </select>
            <Icons.ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-secondary pointer-events-none" />
          </div>
        </div>

        <div>
          <label className="block text-main font-bold mb-2">
            ¿Está esterilizado?
          </label>
          <div className="grid grid-cols-2 gap-4">
            <div
              onClick={() => setEsterilizado(true)}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all duration-200 ${
                esterilizado
                  ? "border-[#e8893c] bg-[rgba(232,137,60,0.18)]"
                  : "border-sidebar-separador bg-gris hover:border-[#e8893c] hover:bg-[rgba(232,137,60,0.18)]"
              }`}
            >
              <div className="font-bold text-base text-main">Sí</div>
            </div>
            <div
              onClick={() => setEsterilizado(false)}
              className={`cursor-pointer rounded-xl border p-4 text-center transition-all duration-200 ${
                !esterilizado
                  ? "border-[#e8893c] bg-[rgba(232,137,60,0.18)]"
                  : "border-sidebar-separador bg-gris hover:border-[#e8893c] hover:bg-[rgba(232,137,60,0.18)]"
              }`}
            >
              <div className="font-bold text-base text-main">No</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="block text-main font-bold">Estado</label>
          <div className="relative w-56">
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              className="appearance-none w-full bg-gris border border-sidebar-separador text-secondary rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200 cursor-pointer [&>option]:bg-[#30302e] [&>option]:text-white"
              style={{ colorScheme: "dark" }}
            >
              <option value="Registrado">Registrado</option>
              <option value="Desaparecido">Desaparecido</option>
              <option value="NoRegistrado">No Registrado</option>
            </select>
            <Icons.ChevronDown className="absolute right-3 top-3.5 w-5 h-5 text-secondary pointer-events-none" />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="block text-main font-bold">Fecha de Nacimiento (Aprox)</label>
          <input
            type="date"
            value={fechaNac}
            onChange={(e) => setFechaNac(e.target.value)}
            className="w-56 bg-gris border border-sidebar-separador rounded-xl px-4 py-3 text-secondary focus:outline-none focus:border-acento-naranja focus:bg-[rgba(232,137,60,0.05)] hover:border-acento-naranja transition-all duration-200"
            style={{ colorScheme: "dark" }}
          />
        </div>
      </form>
    </ModalCrud>
  );
};
