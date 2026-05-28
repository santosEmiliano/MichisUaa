import React, { useMemo } from 'react';
import { FontAwesome5 } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function WebBackground() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  // Generar posiciones aleatorias estables para las patitas
  const paws = useMemo(() =>
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

  const css = `
    @keyframes floatCircle {
      0%, 100% { transform: translate(0, 0) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.05); }
      66% { transform: translate(-20px, 20px) scale(0.95); }
    }
    @keyframes floatPaw {
      0%, 100% { transform: translate(0, 0) rotate(var(--rot)) scale(var(--s)); }
      50% { transform: translate(20px, -20px) rotate(calc(var(--rot) + 10deg)) scale(calc(var(--s) * 1.05)); }
    }
    .bg-circle {
      position: absolute;
      border-radius: 50%;
      animation: floatCircle 20s infinite ease-in-out;
    }
    .paw-container {
      position: absolute;
      opacity: 0.05;
      color: ${colors.textMain};
      animation: floatPaw var(--dur) infinite ease-in-out;
      animation-delay: var(--del);
    }
  `;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0, overflow: 'hidden', backgroundColor: colors.bgDark, pointerEvents: 'none' }}>
      <style dangerouslySetInnerHTML={{ __html: css }} />

      {/* Círculos de fondo con blur */}
      <div
        className="bg-circle"
        style={{ top: '-10%', left: '-10%', width: '50%', height: '50%', opacity: 0.4, filter: 'blur(120px)', background: 'radial-gradient(circle, #e8893c 0%, transparent 70%)' }}
      />
      <div
        className="bg-circle"
        style={{ bottom: '-10%', right: '-10%', width: '60%', height: '60%', opacity: 0.3, filter: 'blur(150px)', background: 'radial-gradient(circle, #3a82c4 0%, transparent 70%)', animationDelay: '-5s' }}
      />
      <div
        className="bg-circle"
        style={{ top: '20%', right: '10%', width: '40%', height: '40%', opacity: 0.25, filter: 'blur(100px)', background: 'radial-gradient(circle, #c84b4b 0%, transparent 70%)', animationDelay: '-10s' }}
      />

      {/* Huellas de gato flotantes */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
        {paws.map((paw) => (
          <div
            key={paw.id}
            className="paw-container"
            style={{
              top: paw.top,
              left: paw.left,
              '--rot': paw.rotation,
              '--s': paw.scale,
              '--dur': paw.duration,
              '--del': paw.delay,
            } as React.CSSProperties}
          >
            <FontAwesome5 name="paw" size={80} color={colors.textMain} />
          </div>
        ))}
      </div>
    </div>
  );
}
