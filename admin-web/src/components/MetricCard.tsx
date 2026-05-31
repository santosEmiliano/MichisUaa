import React, { useState, useEffect } from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  valueSuffix?: string;
  trendText: string;
  trendType?: "success" | "danger" | "warning" | "neutral";
  borderColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  valueSuffix,
  trendText,
  trendType = "success",
  borderColor = "#E8893C",
}) => {
  const [displayValue, setDisplayValue] = useState<number | string>(
    typeof value === "number" ? 0 : value
  );

  useEffect(() => {
    if (typeof value === "number") {
      let start = 0;
      const end = value;
      if (start === end) {
        setDisplayValue(end);
        return;
      }
      
      const duration = 1500; // 1.5 seconds animation
      const startTime = performance.now();

      const animate = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing: easeOutExpo for a nice "slow down at the end" effect
        const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        
        setDisplayValue(Math.floor(easeProgress * end));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setDisplayValue(end);
        }
      };
      
      requestAnimationFrame(animate);
    } else {
      setDisplayValue(value);
    }
  }, [value]);

  let pillClass = "bg-badge-verde text-badge-verde border border-badge-verde";

  if (trendType === "danger") {
    pillClass = "bg-badge-rojo text-badge-rojo border border-badge-rojo";
  } else if (trendType === "warning") {
    pillClass = "bg-badge-naranja text-badge-naranja border border-badge-naranja";
  } else if (trendType === "neutral") {
    pillClass = "bg-badge-gris text-badge-gris border border-badge-gris";
  }

  return (
    <div
      className="bg-gris-oscuro rounded-2xl p-4 sm:p-6 border-t-2 shadow-lg relative overflow-hidden flex flex-col items-start"
      style={{ borderTopColor: borderColor }}
    >
      <h3 className="text-main text-sm sm:text-lg font-bold mb-1 sm:mb-2 leading-tight">{title}</h3>
      <p className="text-3xl sm:text-5xl font-bold text-main mb-2 sm:mb-4">
        {displayValue}
        {valueSuffix && <span className="text-xl sm:text-3xl text-secondary ml-1">{valueSuffix}</span>}
      </p>
      {trendText && (
        <span
          className={`self-center lg:self-start text-center lg:text-left inline-block text-[10px] sm:text-xs font-bold px-2 py-1 sm:px-3 sm:py-1 rounded-lg sm:rounded-full mt-auto ${pillClass}`}
        >
          {trendText}
        </span>
      )}
    </div>
  );
};
