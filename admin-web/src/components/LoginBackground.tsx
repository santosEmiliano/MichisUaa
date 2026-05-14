import React from "react";
import Icons from "./Icons";

const LoginBackground: React.FC = () => {
  // Generamos los datos de las huellas una sola vez para que no cambien en cada render
  const paws = React.useMemo(() => 
    [...Array(8)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      rotation: `${Math.random() * 360}deg`,
      scale: 0.5 + Math.random(),
      duration: `${15 + Math.random() * 10}s`,
      delay: `-${Math.random() * 20}s`,
    })), []
  );

  // Generamos las burbujas/partículas una sola vez
  const particles = React.useMemo(() => 
    [...Array(15)].map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: `${Math.random() * 8 + 4}px`,
      duration: `${10 + Math.random() * 15}s`,
      delay: `-${Math.random() * 10}s`,
      opacity: 0.2 + Math.random() * 0.3,
    })), []
  );

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-dark transition-colors duration-300">
      {/* Círculos de fondo con blur */}
      <div 
        className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-40 blur-[120px] animate-float"
        style={{ background: "radial-gradient(circle, #e8893c 0%, transparent 70%)" }}
      />
      <div 
        className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full opacity-30 blur-[150px] animate-float"
        style={{ background: "radial-gradient(circle, #3a82c4 0%, transparent 70%)", animationDelay: "-5s" }}
      />
      <div 
        className="absolute top-[20%] right-[10%] w-[40%] h-[40%] rounded-full opacity-25 blur-[100px] animate-float"
        style={{ background: "radial-gradient(circle, #c84b4b 0%, transparent 70%)", animationDelay: "-10s" }}
      />

      {/* Huellas de gato flotantes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {paws.map((paw) => (
          <div
            key={paw.id}
            className="absolute text-main opacity-5 animate-float"
            style={{
              top: paw.top,
              left: paw.left,
              transform: `rotate(${paw.rotation}) scale(${paw.scale})`,
              animationDuration: paw.duration,
              animationDelay: paw.delay,
            }}
          >
            <Icons.Paw className="w-24 h-24" />
          </div>
        ))}
      </div>

      {/* Partículas / Burbujas pequeñas */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-main opacity-10 blur-[1px] animate-float"
            style={{
              top: p.top,
              left: p.left,
              width: p.size,
              height: p.size,
              animationDuration: p.duration,
              animationDelay: p.delay,
              opacity: p.opacity,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginBackground;
