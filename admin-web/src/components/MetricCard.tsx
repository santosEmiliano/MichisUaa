import React from "react";

export interface MetricCardProps {
  title: string;
  value: string | number;
  valueSuffix?: string;
  trendText: string;
  trendType?: "success" | "danger" | "neutral";
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
  let pillBg = "bg-[#1A3A2C]";
  let pillText = "text-[#4ADE80]";
  let pillBorder = "border-[#4ADE80]/30";

  if (trendType === "danger") {
    pillBg = "bg-[#3A1A1A]";
    pillText = "text-[#FCA5A5]";
    pillBorder = "border-[#FCA5A5]/30";
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
        {value}
        {valueSuffix && <span className="text-3xl text-secondary ml-1">{valueSuffix}</span>}
      </p>
      <span
        className={`inline-block ${pillBg} ${pillText} text-xs font-bold px-3 py-1 rounded-full border ${pillBorder} mt-auto`}
      >
        {trendText}
      </span>
    </div>
  );
};
