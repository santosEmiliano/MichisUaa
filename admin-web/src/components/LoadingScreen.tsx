import Icons from "./Icons";

interface LoadingScreenProps {
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = "Cargando datos..." }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-8">
        <div className="animate-bounce" style={{ animationDelay: "0ms" }}>
          <Icons.Paw className="w-10 h-10 text-[#E8893C] rotate-[-15deg] opacity-40 shadow-glow" />
        </div>
        <div className="animate-bounce" style={{ animationDelay: "150ms" }}>
          <Icons.Paw className="w-10 h-10 text-[#E8893C] rotate-[15deg] opacity-70" />
        </div>
        <div className="animate-bounce" style={{ animationDelay: "300ms" }}>
          <Icons.Paw className="w-10 h-10 text-[#E8893C] rotate-[-10deg]" />
        </div>
      </div>
      
      <div className="relative">
        <p className="text-secondary text-sm font-medium tracking-widest uppercase animate-pulse">
          {message}
        </p>
        <div className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#E8893C]/40 to-transparent"></div>
      </div>
    </div>
  );
};
