import {
  ArrowRight,
  Boxes,
  Building2,
  Calendar,
  Compass,
  DollarSign,
  GraduationCap,
  Info,
  Plus,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { formatBRL, formatDateBR } from '../../utils/finance';
import { ProfitDistributionCard } from '../dashboard/ProfitDistributionCard';
import { RevenueCostChart } from '../dashboard/RevenueCostChart';

export const DashboardScreen: React.FC = () => {
  const {
    monthlyFinancials,
    trainings,
    companies,
    prospects,
    investments,
    setActiveScreen,
    setModalNewTrainingOpen,
    settings,
  } = useApp();

  const {
    trainingsCompletedCount,
    participantsTotal,
    trainingRevenue,
    directCostsTotal,
    operationalExpensesTotal,
    totalCosts,
    netProfit,
    hasLoss,
    periodLabel,
  } = monthlyFinancials;

  // Commercial indicators
  const totalCompaniesCount = companies.length;
  const toVisitCount = prospects.filter((p) => p.status === 'A visitar').length;
  const visitedAttendedCount = prospects.filter((p) => p.status === 'Visitada — atendida').length;
  const visitedNotAttendedCount = prospects.filter((p) => p.status === 'Visitada — não atendida').length;
  const pendingInvestmentsCount = investments.filter((i) => i.status !== 'Adquirido').length;

  // Recent 5 trainings
  const recentTrainings = [...trainings]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#20313C] dark:text-[#EDF3F5] tracking-tight">
            Olá, Erik.
          </h2>
          <p className="text-xs sm:text-sm text-[#71818B] dark:text-[#A8B6BE] mt-1">
            Acompanhe a operação, os custos e o resultado financeiro da Protec Seg — Treinamentos ({periodLabel}).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setModalNewTrainingOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Novo treinamento</span>
          </button>
        </div>
      </div>

      {/* Demo Data Alert Banner */}
      {settings.isDemoData && (
        <div className="bg-[#E4F4EF] dark:bg-[#16836F]/10 border border-[#16836F]/30 rounded-xl p-3.5 flex items-start sm:items-center justify-between gap-3 text-xs text-[#153246] dark:text-[#E4F4EF]">
          <div className="flex items-center gap-2.5">
            <Info className="w-4 h-4 text-[#16836F] shrink-0" />
            <span>
              <strong>Modo Demonstrativo:</strong> Os registros exibidos são exemplos didáticos para verificação das regras de cálculo e relatórios. Você pode editar, excluir ou limpar a base em <em>Configurações</em>.
            </span>
          </div>
          <button
            onClick={() => setActiveScreen('configuracoes')}
            className="text-[11px] font-bold text-[#16836F] hover:underline whitespace-nowrap"
          >
            Gerenciar dados
          </button>
        </div>
      )}

      {/* 4 Main KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Treinamentos realizados */}
        <div className="bg-white dark:bg-[#1B272F] p-4.5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71818B] dark:text-[#A8B6BE] mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase">Treinamentos</span>
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
              {trainingsCompletedCount}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1">
              <Users className="w-3.5 h-3.5 text-[#16836F]" />
              <span className="font-semibold text-[#20313C] dark:text-[#EDF3F5]">{participantsTotal}</span>
              <span>participantes capacitados</span>
            </div>
          </div>
        </div>

        {/* Card 2: Receita dos treinamentos */}
        <div className="bg-white dark:bg-[#1B272F] p-4.5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71818B] dark:text-[#A8B6BE] mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase">Receita Realizada</span>
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#16836F] tabular-nums">
              {formatBRL(trainingRevenue)}
            </div>
            <div className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1">
              Treinamentos concluídos no mês
            </div>
          </div>
        </div>

        {/* Card 3: Custos do mês */}
        <div className="bg-white dark:bg-[#1B272F] p-4.5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71818B] dark:text-[#A8B6BE] mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase">Custos do Mês</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[#D5A34C] flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-[#D5A34C] tabular-nums">
              {formatBRL(totalCosts)}
            </div>
            <div className="text-[11px] text-[#71818B] dark:text-[#A8B6BE] mt-1 space-x-1">
              <span>Diretos: {formatBRL(directCostsTotal)}</span>
              <span>·</span>
              <span>Ops: {formatBRL(operationalExpensesTotal)}</span>
            </div>
          </div>
        </div>

        {/* Card 4: Lucro líquido estimado */}
        <div className="bg-white dark:bg-[#1B272F] p-4.5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-[#71818B] dark:text-[#A8B6BE] mb-2">
            <span className="text-[11px] font-bold tracking-wider uppercase">Lucro Líquido</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                hasLoss
                  ? 'bg-red-50 dark:bg-red-950/30 text-[#B94949]'
                  : 'bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F]'
              }`}
            >
              {hasLoss ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-extrabold tabular-nums ${
                hasLoss ? 'text-[#B94949]' : 'text-[#16836F]'
              }`}
            >
              {formatBRL(netProfit)}
            </div>
            <div className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1">
              {hasLoss ? 'Prejuízo gerencial no período' : 'Receita total − custos e despesas'}
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Charts and Profit Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueCostChart />
        </div>
        <div className="lg:col-span-1">
          <ProfitDistributionCard />
        </div>
      </div>

      {/* Row 3: Commercial Indicators Grid */}
      <div className="bg-white dark:bg-[#1B272F] p-5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Indicadores Comerciais & Operacionais
            </h3>
            <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
              Acompanhamento de clientes, pipeline de visitas e investimentos
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('prospeccao')}
            className="text-xs font-semibold text-[#16836F] hover:underline flex items-center gap-1"
          >
            <span>Ver prospecções</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <div
            onClick={() => setActiveScreen('empresas')}
            className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] cursor-pointer hover:border-[#16836F] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#71818B] text-xs mb-1">
              <Building2 className="w-3.5 h-3.5 text-[#1C4357] dark:text-[#A8B6BE]" />
              <span>Empresas</span>
            </div>
            <div className="text-xl font-extrabold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
              {totalCompaniesCount}
            </div>
            <div className="text-[10px] text-[#71818B] mt-0.5">Cadastradas</div>
          </div>

          <div
            onClick={() => setActiveScreen('prospeccao')}
            className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] cursor-pointer hover:border-[#16836F] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#71818B] text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-[#D5A34C]" />
              <span>A Visitar</span>
            </div>
            <div className="text-xl font-extrabold text-[#D5A34C] tabular-nums">
              {toVisitCount}
            </div>
            <div className="text-[10px] text-[#71818B] mt-0.5">Agendadas/Pendentes</div>
          </div>

          <div
            onClick={() => setActiveScreen('prospeccao')}
            className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] cursor-pointer hover:border-[#16836F] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#71818B] text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-[#16836F]" />
              <span>Visitadas</span>
            </div>
            <div className="text-xl font-extrabold text-[#16836F] tabular-nums">
              {visitedAttendedCount}
            </div>
            <div className="text-[10px] text-[#71818B] mt-0.5">Atendidas</div>
          </div>

          <div
            onClick={() => setActiveScreen('prospeccao')}
            className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] cursor-pointer hover:border-[#16836F] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#71818B] text-xs mb-1">
              <Compass className="w-3.5 h-3.5 text-[#71818B]" />
              <span>Não Atendidas</span>
            </div>
            <div className="text-xl font-extrabold text-[#71818B] dark:text-[#A8B6BE] tabular-nums">
              {visitedNotAttendedCount}
            </div>
            <div className="text-[10px] text-[#71818B] mt-0.5">Reagendar contato</div>
          </div>

          <div
            onClick={() => setActiveScreen('investimentos')}
            className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] cursor-pointer hover:border-[#16836F] transition-colors"
          >
            <div className="flex items-center gap-2 text-[#71818B] text-xs mb-1">
              <Boxes className="w-3.5 h-3.5 text-[#153246] dark:text-[#A8B6BE]" />
              <span>Investimentos</span>
            </div>
            <div className="text-xl font-extrabold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
              {pendingInvestmentsCount}
            </div>
            <div className="text-[10px] text-[#71818B] mt-0.5">Itens planejados</div>
          </div>
        </div>
      </div>

      {/* Row 4: Recent Trainings Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Treinamentos Recentes
            </h3>
            <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
              Últimos treinamentos registrados no sistema
            </p>
          </div>
          <button
            onClick={() => setActiveScreen('treinamentos')}
            className="px-3 py-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] hover:bg-[#F4F7F8] dark:hover:bg-[#202E37] text-xs font-semibold text-[#20313C] dark:text-[#EDF3F5] transition-colors"
          >
            Ver todos ({trainings.length})
          </button>
        </div>

        {recentTrainings.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#71818B] dark:text-[#A8B6BE]">
            Nenhum treinamento registrado até o momento.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Treinamento</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receita</th>
                  <th className="py-3 px-4 text-right">Resultado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {recentTrainings.map((t) => {
                  const isDone = t.status === 'Realizado';
                  const isScheduled = t.status === 'Agendado';
                  const isCancelled = t.status === 'Cancelado';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[#F8FAFB]/80 dark:hover:bg-[#202E37]/60 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div className="flex items-center gap-2">
                          {t.nrNumber && (
                            <span className="text-[10px] font-bold text-[#16836F] dark:text-[#38D39F]">
                              {t.nrNumber}
                            </span>
                          )}
                          <span className="truncate max-w-xs">{t.title}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#71818B] dark:text-[#A8B6BE]">
                        {t.companyName}
                      </td>
                      <td className="py-3 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        {formatDateBR(t.date)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isDone
                              ? 'text-[#16836F]'
                              : isScheduled
                              ? 'text-[#D5A34C]'
                              : 'text-[#B94949]'
                          }`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
                        {formatBRL(t.revenue)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold tabular-nums">
                        <span
                          className={
                            t.directResult >= 0 ? 'text-[#16836F]' : 'text-[#B94949]'
                          }
                        >
                          {formatBRL(t.directResult)}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
