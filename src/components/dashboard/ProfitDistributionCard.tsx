import { AlertCircle, ArrowUpRight, CheckCircle2, PieChart, ShieldAlert } from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL } from '../../utils/finance';

export const ProfitDistributionCard: React.FC = () => {
  const { monthlyFinancials, settings, setActiveScreen } = useApp();

  const {
    netProfit,
    investmentReserve,
    distributableProfit,
    shareProtec,
    shareErik,
    hasLoss,
    isZero,
    periodLabel,
  } = monthlyFinancials;

  return (
    <div className="bg-white dark:bg-[#1B272F] p-5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
                Distribuição do Lucro
              </h3>
              <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
                Competência: {periodLabel}
              </p>
            </div>
          </div>

          <button
            onClick={() => setActiveScreen('configuracoes')}
            className="text-[11px] font-semibold text-[#16836F] hover:underline flex items-center gap-1"
            title="Ajustar regras nas configurações"
          >
            <span>Configurar %</span>
            <ArrowUpRight className="w-3 h-3" />
          </button>
        </div>

        {/* Lucro Líquido Header Metric */}
        <div className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] mb-4">
          <div className="text-[11px] text-[#71818B] dark:text-[#A8B6BE] font-medium mb-1">
            Lucro Líquido Gerencial
          </div>
          <div
            className={`text-xl sm:text-2xl font-extrabold tabular-nums tracking-tight ${
              hasLoss
                ? 'text-[#B94949]'
                : isZero
                ? 'text-[#71818B] dark:text-[#A8B6BE]'
                : 'text-[#16836F]'
            }`}
          >
            {formatBRL(netProfit)}
          </div>
          <div className="text-[10px] text-[#71818B] dark:text-[#A8B6BE] mt-1">
            Receitas menos custos diretos e despesas operacionais
          </div>
        </div>

        {/* Case 1: Prejuízo ou Ausência de Lucro */}
        {hasLoss && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-[#B94949] flex items-start gap-2.5 text-xs">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Resultado negativo no período.</span>
              <p className="text-[11px] mt-0.5 text-red-700 dark:text-red-300">
                Não há distribuição de lucro positiva a ser realizada neste mês.
              </p>
            </div>
          </div>
        )}

        {isZero && (
          <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] text-[#71818B] dark:text-[#A8B6BE] flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#D5A34C]" />
            <div>
              <span className="font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                Resultado neutro (R$ 0,00).
              </span>
              <p className="text-[11px] mt-0.5">
                Nenhum valor a distribuir no período selecionado.
              </p>
            </div>
          </div>
        )}

        {/* Case 2: Lucro Positivo com Divisão */}
        {!hasLoss && !isZero && (
          <div className="space-y-3">
            {/* Reserva de investimentos */}
            {settings.investmentReservePercent > 0 && (
              <div className="flex items-center justify-between py-2 border-b border-[#E2E9EC] dark:border-[#34434C] text-xs">
                <div>
                  <div className="font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                    Reserva para Investimentos ({settings.investmentReservePercent}%)
                  </div>
                  <div className="text-[10px] text-[#71818B]">
                    Retido para aquisição de bens e equipamentos
                  </div>
                </div>
                <div className="text-right font-bold text-[#D5A34C] tabular-nums">
                  {formatBRL(investmentReserve)}
                </div>
              </div>
            )}

            {/* Total Distribuível */}
            <div className="flex items-center justify-between text-xs py-1 text-[#71818B] dark:text-[#A8B6BE]">
              <span>Valor líquido distribuível:</span>
              <span className="font-semibold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
                {formatBRL(distributableProfit)}
              </span>
            </div>

            {/* Participações */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Protec Seg */}
              <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#20313C] dark:text-[#EDF3F5]">
                    Protec Seg
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] font-bold">
                    {settings.shareProtecPercent}%
                  </span>
                </div>
                <div className="text-base font-extrabold text-[#16836F] tabular-nums">
                  {formatBRL(shareProtec)}
                </div>
                <div className="text-[10px] text-[#71818B] mt-0.5">Empresa</div>
              </div>

              {/* Erik Coronado */}
              <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-bold text-[#20313C] dark:text-[#EDF3F5]">
                    Erik Coronado
                  </span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] font-bold">
                    {settings.shareErikPercent}%
                  </span>
                </div>
                <div className="text-base font-extrabold text-[#16836F] tabular-nums">
                  {formatBRL(shareErik)}
                </div>
                <div className="text-[10px] text-[#71818B] mt-0.5">Sócio / Instrutor</div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="pt-3 mt-3 border-t border-[#E2E9EC] dark:border-[#34434C] text-[10px] text-[#71818B] dark:text-[#A8B6BE] flex items-center gap-1.5">
        <CheckCircle2 className="w-3.5 h-3.5 text-[#16836F] shrink-0" />
        <span>Cálculo gerencial automatizado conforme política configurada.</span>
      </div>
    </div>
  );
};
