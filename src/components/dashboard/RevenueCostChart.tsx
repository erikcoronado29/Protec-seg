import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, getSixMonthsFinancialSeries } from '../../utils/finance';

export const RevenueCostChart: React.FC = () => {
  const { trainings, expenses, selectedYear, selectedMonth } = useApp();
  const [hoveredData, setHoveredData] = useState<{
    label: string;
    revenue: number;
    totalCosts: number;
    netProfit: number;
    x: number;
    y: number;
  } | null>(null);

  const series = getSixMonthsFinancialSeries(trainings, expenses, selectedYear, selectedMonth);

  // Find max value for chart scale (min 1000 to prevent zero division)
  const maxVal = Math.max(
    1000,
    ...series.map((s) => Math.max(s.revenue, s.totalCosts))
  );

  return (
    <div className="bg-white dark:bg-[#1B272F] p-5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
            Comparativo: Receitas vs. Custos Totais
          </h3>
          <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
            Evolução financeira dos últimos 6 meses com base nos dados registrados
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#16836F]" />
            <span className="text-[#20313C] dark:text-[#EDF3F5]">Receitas</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-[#D5A34C]" />
            <span className="text-[#20313C] dark:text-[#EDF3F5]">Custos Totais</span>
          </div>
        </div>
      </div>

      {/* Responsive Bar Graphic */}
      <div className="relative h-56 w-full pt-4">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-7 text-[10px] text-[#71818B]/60 tabular-nums">
          <div className="border-b border-dashed border-[#E2E9EC] dark:border-[#34434C] w-full flex justify-between">
            <span>{formatBRL(maxVal)}</span>
          </div>
          <div className="border-b border-dashed border-[#E2E9EC] dark:border-[#34434C] w-full flex justify-between">
            <span>{formatBRL(maxVal * 0.5)}</span>
          </div>
          <div className="border-b border-[#E2E9EC] dark:border-[#34434C] w-full flex justify-between">
            <span>R$ 0,00</span>
          </div>
        </div>

        {/* Bars Container */}
        <div className="relative h-full flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 pb-7">
          {series.map((item, idx) => {
            const revHeightPct = Math.min(100, Math.max(3, (item.revenue / maxVal) * 100));
            const costHeightPct = Math.min(100, Math.max(3, (item.totalCosts / maxVal) * 100));
            const isCurrentMonth = idx === series.length - 1;

            return (
              <div
                key={item.yearMonth}
                className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHoveredData({
                    label: item.label,
                    revenue: item.revenue,
                    totalCosts: item.totalCosts,
                    netProfit: item.netProfit,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHoveredData(null)}
              >
                {/* Bars Pair */}
                <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                  {/* Revenue Bar */}
                  <div
                    className="w-full max-w-[24px] bg-[#16836F] rounded-t-sm transition-all duration-300 hover:brightness-110 shadow-xs relative"
                    style={{ height: `${revHeightPct}%` }}
                  />
                  {/* Cost Bar */}
                  <div
                    className="w-full max-w-[24px] bg-[#D5A34C] rounded-t-sm transition-all duration-300 hover:brightness-110 shadow-xs relative"
                    style={{ height: `${costHeightPct}%` }}
                  />
                </div>

                {/* X-axis label */}
                <span
                  className={`mt-2 text-[10px] sm:text-[11px] font-semibold truncate ${
                    isCurrentMonth
                      ? 'text-[#16836F] font-bold'
                      : 'text-[#71818B] dark:text-[#A8B6BE]'
                  }`}
                >
                  {item.shortLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Tooltip */}
      {hoveredData && (
        <div className="absolute top-4 right-4 z-20 bg-[#153246] text-white p-3 rounded-xl shadow-xl border border-[#1C4357] text-xs pointer-events-none animate-in fade-in duration-100">
          <div className="font-bold text-white mb-1.5 pb-1 border-b border-[#1C4357]">
            {hoveredData.label}
          </div>
          <div className="space-y-1 text-[11px]">
            <div className="flex justify-between gap-4">
              <span className="text-[#E4F4EF] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#16836F]" /> Receita:
              </span>
              <span className="font-bold tabular-nums">{formatBRL(hoveredData.revenue)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-[#E4F4EF] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#D5A34C]" /> Custos:
              </span>
              <span className="font-bold tabular-nums">{formatBRL(hoveredData.totalCosts)}</span>
            </div>
            <div className="flex justify-between gap-4 pt-1 border-t border-[#1C4357]/60">
              <span className="text-white font-semibold">Resultado:</span>
              <span
                className={`font-bold tabular-nums ${
                  hoveredData.netProfit >= 0 ? 'text-[#38D39F]' : 'text-[#FF7675]'
                }`}
              >
                {formatBRL(hoveredData.netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
