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

  let pillBg = "bg-[#1A3A2C]";
  let pillText = "text-[#4ADE80]";
  let pillBorder = "border-[#4ADE80]/30";

  if (trendType === "danger") {
    pillBg = "bg-[#3A1A1A]";
    pillText = "text-[#FCA5A5]";
    pillBorder = "border-[#FCA5A5]/30";
  } else if (trendType === "warning") {
    pillBg = "bg-[#3A2E1A]";
    pillText = "text-[#FCD34D]";
    pillBorder = "border-[#FCD34D]/30";
  } else if (trendType === "neutral") {
    pillBg = "bg-sidebar-separador";
    pillText = "text-secondary";
    pillBorder = "border-secondary/30";
  }

  return (
    <div
      className="bg-gris-oscuro rounded-2xl p-6 border-t-2 shadow-lg relative overflow-hidden flex flex-col items-start"
      style={{ borderTopColor: borderColor }}
    >
      <h3 className="text-white text-lg font-bold mb-2">{title}</h3>
      <p className="text-5xl font-bold text-white mb-4">
        {displayValue}
        {valueSuffix && <span className="text-3xl text-secondary ml-1">{valueSuffix}</span>}
      </p>
      {trendText && (
        <span
          className={`inline-block ${pillBg} ${pillText} text-xs font-bold px-3 py-1 rounded-full border ${pillBorder} mt-auto`}
        >
          {trendText}
        </span>
      )}
    </div>
  );
};
