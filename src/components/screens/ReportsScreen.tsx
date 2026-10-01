import {
  Boxes,
  Building2,
  Calendar,
  CheckCircle2,
  Compass,
  DollarSign,
  Download,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Printer,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget } from '../../types';
import {
  formatBRL,
  formatDateBR,
  MONTH_NAMES_PT,
} from '../../utils/finance';

type ReportType =
  | 'gerencial'
  | 'treinamentos'
  | 'financeiro'
  | 'patrimonio'
  | 'prospeccao'
  | 'investimentos'
  | 'orcamento';

export const ReportsScreen: React.FC = () => {
  const {
    trainings,
    expenses,
    companies,
    budgets,
    assets,
    prospects,
    investments,
    monthlyFinancials,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
    settings,
    selectedBudgetForPrint,
    setSelectedBudgetForPrint,
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportType | null>(
    selectedBudgetForPrint ? 'orcamento' : null
  );
  const [selectedBudgetId, setSelectedBudgetId] = useState<string>(
    selectedBudgetForPrint?.id || budgets[0]?.id || ''
  );

  const targetYM = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
  const periodLabel = `${MONTH_NAMES_PT[selectedMonth - 1]} de ${selectedYear}`;
  const generationTimestamp = new Date().toLocaleString('pt-BR');

  // Completed trainings of the month
  const monthlyTrainings = trainings.filter(
    (t) => t.status === 'Realizado' && t.date.startsWith(targetYM)
  );

  // All trainings of the month (including scheduled/cancelled)
  const allMonthlyTrainings = trainings.filter((t) => t.date.startsWith(targetYM));

  // Monthly expenses
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(targetYM));

  const handlePrint = () => {
    window.print();
  };

  const closeReportModal = () => {
    setActiveReport(null);
    setSelectedBudgetForPrint(null);
  };

  const currentBudgetToPrint = budgets.find((b) => b.id === selectedBudgetId) || budgets[0];

  const reportCards = [
    {
      type: 'gerencial' as ReportType,
      title: 'Resumo Gerencial Mensal',
      subtitle: `Demonstrativo consolidado de receitas, custos, resultado e divisão do lucro (${periodLabel})`,
      icon: DollarSign,
      color: '#16836F',
      recordCount: `${monthlyTrainings.length} cursos · ${formatBRL(monthlyFinancials.trainingRevenue)}`,
    },
    {
      type: 'treinamentos' as ReportType,
      title: 'Relatório de Treinamentos',
      subtitle: `Detalhamento de turmas, quilometragem, horas-homem e resultado por treinamento (${periodLabel})`,
      icon: GraduationCap,
      color: '#1C4357',
      recordCount: `${allMonthlyTrainings.length} treinamento(s) no mês`,
    },
    {
      type: 'financeiro' as ReportType,
      title: 'Relatório Financeiro & Despesas',
      subtitle: `Demonstrativo analítico de despesas por categoria, custos diretos e fluxo de pagamentos (${periodLabel})`,
      icon: FileSpreadsheet,
      color: '#D5A34C',
      recordCount: `${monthlyExpenses.length} despesa(s) registradas`,
    },
    {
      type: 'patrimonio' as ReportType,
      title: 'Inventário Patrimonial',
      subtitle: 'Relação completa de ativos, imobilizados, estado de conservação e localização',
      icon: Boxes,
      color: '#153246',
      recordCount: `${assets.length} item(ns) cadastrados`,
    },
    {
      type: 'prospeccao' as ReportType,
      title: 'Relatório de Prospecção & Visitas',
      subtitle: 'Histórico de contatos comerciais, empresas a visitar e próximas ações',
      icon: Compass,
      color: '#16836F',
      recordCount: `${prospects.length} prospecção(ões)`,
    },
    {
      type: 'investimentos' as ReportType,
      title: 'Plano de Investimentos & Compras',
      subtitle: 'Necessidades futuras de equipamentos, justificativas técnicas e prioridades',
      icon: TrendingUp,
      color: '#D5A34C',
      recordCount: `${investments.length} item(ns) planejados`,
    },
    {
      type: 'orcamento' as ReportType,
      title: 'Proposta Comercial / Orçamento',
      subtitle: 'Documento individual do cliente com serviços, valores, prazos e termo de aceite',
      icon: FileText,
      color: '#1C4357',
      recordCount: `${budgets.length} proposta(s) disponível(is)`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#20313C] dark:text-[#EDF3F5] tracking-tight">
            Central de Relatórios em PDF
          </h2>
          <p className="text-xs sm:text-sm text-[#71818B] dark:text-[#A8B6BE] mt-1">
            Gere relatórios gerenciais e operacionais formatados em padrão A4 para visualização, impressão ou exportação em PDF.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-[#71818B] dark:text-[#A8B6BE] font-semibold flex items-center gap-1.5 bg-[#F8FAFB] dark:bg-[#202E37] px-3 py-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C]">
            <Calendar className="w-3.5 h-3.5 text-[#16836F]" />
            <span>Competência: {periodLabel}</span>
          </div>
        </div>
      </div>

      {/* Grid of Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((rc) => {
          const IconComp = rc.icon;

          return (
            <div
              key={rc.type}
              className="bg-white dark:bg-[#1B272F] p-5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs flex flex-col justify-between hover:border-[#16836F]/50 transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-xs"
                    style={{ backgroundColor: rc.color }}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] text-[#71818B] dark:text-[#A8B6BE] font-medium">
                    {rc.recordCount}
                  </span>
                </div>

                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5] group-hover:text-[#16836F] transition-colors">
                  {rc.title}
                </h3>
                <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1.5 leading-relaxed">
                  {rc.subtitle}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
                <button
                  onClick={() => setActiveReport(rc.type)}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] hover:bg-[#16836F] hover:text-white text-[#20313C] dark:text-[#EDF3F5] text-xs font-bold transition-all border border-[#E2E9EC] dark:border-[#34434C]"
                >
                  <FileText className="w-4 h-4" />
                  <span>Gerar Relatório em PDF</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Report Modal Overlay */}
      {activeReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
          <div className="w-full max-w-4xl bg-white text-[#20313C] rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col my-auto max-h-[96vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
            {/* Modal Controls (Hidden in Print) */}
            <div className="p-4 bg-[#153246] text-white flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2 text-xs font-bold">
                <FileText className="w-4 h-4 text-[#38D39F]" />
                <span>Visualização de Impressão / Documento PDF</span>
              </div>
              <div className="flex items-center gap-2">
                {activeReport === 'orcamento' && budgets.length > 0 && (
                  <select
                    value={selectedBudgetId}
                    onChange={(e) => setSelectedBudgetId(e.target.value)}
                    className="text-xs bg-[#1C4357] text-white border border-[#2B5770] rounded-lg p-1.5 outline-hidden"
                  >
                    {budgets.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.code} — {b.companyName}
                      </option>
                    ))}
                  </select>
                )}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16836F] hover:bg-[#126b5a] text-white rounded-lg text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Imprimir / Salvar PDF</span>
                </button>
                <button
                  onClick={closeReportModal}
                  className="p-1.5 text-gray-300 hover:text-white rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Container */}
            <div
              id="printable-report-area"
              className="flex-1 overflow-y-auto p-8 sm:p-12 bg-white text-[#20313C] space-y-6 print:overflow-visible print:p-0"
            >
              {/* Document Header (Protec Seg letterhead) */}
              <div className="border-b-2 border-[#153246] pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-xl bg-[#16836F] flex items-center justify-center font-extrabold text-2xl text-white">
                    P
                  </div>
                  <div>
                    <h1 className="font-extrabold text-xl text-[#153246] tracking-wider leading-tight">
                      PROTEC SEG
                    </h1>
                    <p className="text-xs uppercase font-bold tracking-wider text-[#16836F]">
                      GESTÃO & TREINAMENTOS EM SST
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Engenharia e Segurança do Trabalho · CNPJ: 00.000.000/0001-00
                    </p>
                  </div>
                </div>

                <div className="text-right text-xs text-gray-600">
                  <div className="font-bold text-[#153246]">
                    Erik Coronado — Resp. Técnico
                  </div>
                  <div>Período: {periodLabel}</div>
                  <div className="text-[10px] text-gray-400">Emissão: {generationTimestamp}</div>
                </div>
              </div>

              {/* REPORT 1: RESUMO GERENCIAL MENSAL */}
              {activeReport === 'gerencial' && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#153246] uppercase">
                      Resumo Gerencial Mensal
                    </h2>
                    <p className="text-xs text-gray-500">
                      Consolidação financeira e operacional do mês de {periodLabel}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-gray-500 text-[10px] uppercase font-bold">
                        Treinamentos Concluídos
                      </div>
                      <div className="text-lg font-bold text-[#153246]">
                        {monthlyFinancials.trainingsCompletedCount}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {monthlyFinancials.participantsTotal} participantes
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-gray-500 text-[10px] uppercase font-bold">
                        Receita dos Cursos
                      </div>
                      <div className="text-lg font-bold text-[#16836F]">
                        {formatBRL(monthlyFinancials.trainingRevenue)}
                      </div>
                      <div className="text-[10px] text-gray-500">Total faturado</div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-gray-500 text-[10px] uppercase font-bold">
                        Custos Totais
                      </div>
                      <div className="text-lg font-bold text-[#D5A34C]">
                        {formatBRL(monthlyFinancials.totalCosts)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        Diretos: {formatBRL(monthlyFinancials.directCostsTotal)} · Ops:{' '}
                        {formatBRL(monthlyFinancials.operationalExpensesTotal)}
                      </div>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                      <div className="text-gray-500 text-[10px] uppercase font-bold">
                        Lucro Líquido Estimado
                      </div>
                      <div
                        className={`text-lg font-bold ${
                          monthlyFinancials.hasLoss ? 'text-[#B94949]' : 'text-[#16836F]'
                        }`}
                      >
                        {formatBRL(monthlyFinancials.netProfit)}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {monthlyFinancials.hasLoss ? 'Prejuízo no mês' : 'Resultado positivo'}
                      </div>
                    </div>
                  </div>

                  {/* Divisão dos Resultados */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                    <h3 className="font-bold text-xs text-[#153246] uppercase">
                      Demonstrativo de Divisão do Lucro
                    </h3>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span>Lucro Líquido do Período:</span>
                        <strong className="tabular-nums">
                          {formatBRL(monthlyFinancials.netProfit)}
                        </strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200">
                        <span>
                          (-) Reserva para Investimentos ({settings.investmentReservePercent}%):
                        </span>
                        <strong className="text-[#D5A34C] tabular-nums">
                          {formatBRL(monthlyFinancials.investmentReserve)}
                        </strong>
                      </div>
                      <div className="flex justify-between py-1 border-b border-gray-200 font-bold">
                        <span>(=) Valor Líquido Distribuível:</span>
                        <strong className="tabular-nums">
                          {formatBRL(monthlyFinancials.distributableProfit)}
                        </strong>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                          <div className="text-gray-500 text-[10px]">
                            Protec Seg ({settings.shareProtecPercent}%)
                          </div>
                          <div className="text-base font-bold text-[#16836F] tabular-nums">
                            {formatBRL(monthlyFinancials.shareProtec)}
                          </div>
                        </div>
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200">
                          <div className="text-gray-500 text-[10px]">
                            Erik Coronado ({settings.shareErikPercent}%)
                          </div>
                          <div className="text-base font-bold text-[#16836F] tabular-nums">
                            {formatBRL(monthlyFinancials.shareErik)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Completed trainings list */}
                  <div>
                    <h3 className="font-bold text-xs text-[#153246] uppercase mb-2">
                      Treinamentos Concluídos no Mês ({monthlyTrainings.length})
                    </h3>
                    {monthlyTrainings.length === 0 ? (
                      <div className="text-xs text-gray-500 p-4 border rounded-xl text-center">
                        Nenhum treinamento realizado neste período.
                      </div>
                    ) : (
                      <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                        <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                          <tr>
                            <th className="p-2.5">Treinamento</th>
                            <th className="p-2.5">Empresa</th>
                            <th className="p-2.5">Data</th>
                            <th className="p-2.5 text-center">Alunos</th>
                            <th className="p-2.5 text-right">Receita</th>
                            <th className="p-2.5 text-right">Custo Direto</th>
                            <th className="p-2.5 text-right">Resultado</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {monthlyTrainings.map((t) => (
                            <tr key={t.id}>
                              <td className="p-2.5 font-semibold">
                                {t.nrNumber ? `${t.nrNumber} - ` : ''}
                                {t.title}
                              </td>
                              <td className="p-2.5 text-gray-600">{t.companyName}</td>
                              <td className="p-2.5 text-gray-600">{formatDateBR(t.date)}</td>
                              <td className="p-2.5 text-center">{t.participants}</td>
                              <td className="p-2.5 text-right font-medium">
                                {formatBRL(t.revenue)}
                              </td>
                              <td className="p-2.5 text-right text-gray-600">
                                {formatBRL(t.totalDirectCost)}
                              </td>
                              <td className="p-2.5 text-right font-bold text-[#16836F]">
                                {formatBRL(t.directResult)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}

              {/* REPORT 2: TREINAMENTOS DETALHADOS */}
              {activeReport === 'treinamentos' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#153246] uppercase">
                      Relatório Analítico de Treinamentos
                    </h2>
                    <p className="text-xs text-gray-500">
                      Acompanhamento de custos de deslocamento, mão de obra e materiais ({periodLabel})
                    </p>
                  </div>

                  {allMonthlyTrainings.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-gray-500">
                      Nenhum treinamento registrado para este período.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Curso / Código</th>
                          <th className="p-2">Empresa</th>
                          <th className="p-2">Data / Status</th>
                          <th className="p-2 text-right">Receita</th>
                          <th className="p-2 text-right">Deslocamento</th>
                          <th className="p-2 text-right">Mão de Obra</th>
                          <th className="p-2 text-right">Outros</th>
                          <th className="p-2 text-right">Custo Total</th>
                          <th className="p-2 text-right">Resultado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {allMonthlyTrainings.map((t) => (
                          <tr key={t.id}>
                            <td className="p-2 font-semibold">
                              <div>{t.title}</div>
                              <div className="text-[10px] text-gray-400">{t.code}</div>
                            </td>
                            <td className="p-2 text-gray-600">{t.companyName}</td>
                            <td className="p-2 text-gray-600">
                              <div>{formatDateBR(t.date)}</div>
                              <div className="text-[10px] font-bold text-[#16836F]">{t.status}</div>
                            </td>
                            <td className="p-2 text-right font-medium">{formatBRL(t.revenue)}</td>
                            <td className="p-2 text-right text-gray-600">
                              <div>{formatBRL(t.travelCost)}</div>
                              <div className="text-[10px] text-gray-400">{t.distanceKm} km</div>
                            </td>
                            <td className="p-2 text-right text-gray-600">
                              <div>{formatBRL(t.laborCost)}</div>
                              <div className="text-[10px] text-gray-400">{t.manHours}h</div>
                            </td>
                            <td className="p-2 text-right text-gray-600">
                              {formatBRL(t.otherCosts)}
                            </td>
                            <td className="p-2 text-right font-bold text-[#D5A34C]">
                              {formatBRL(t.totalDirectCost)}
                            </td>
                            <td className="p-2 text-right font-extrabold text-[#16836F]">
                              {formatBRL(t.directResult)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REPORT 3: FINANCEIRO */}
              {activeReport === 'financeiro' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#153246] uppercase">
                      Demonstrativo Financeiro & Custos Operacionais
                    </h2>
                    <p className="text-xs text-gray-500">
                      Relação de despesas operacionais da empresa ({periodLabel})
                    </p>
                  </div>

                  {monthlyExpenses.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-gray-500">
                      Nenhuma despesa operacional cadastrada para este mês.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Descrição</th>
                          <th className="p-2">Categoria</th>
                          <th className="p-2">Data / Vencimento</th>
                          <th className="p-2">Forma</th>
                          <th className="p-2">Status</th>
                          <th className="p-2 text-right">Valor</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {monthlyExpenses.map((e) => (
                          <tr key={e.id}>
                            <td className="p-2 font-semibold">{e.description}</td>
                            <td className="p-2 text-gray-600">{e.category}</td>
                            <td className="p-2 text-gray-600">
                              {formatDateBR(e.date)} (Venc: {formatDateBR(e.dueDate)})
                            </td>
                            <td className="p-2 text-gray-600">{e.paymentMethod || '—'}</td>
                            <td className="p-2 font-bold text-[#16836F]">{e.status}</td>
                            <td className="p-2 text-right font-bold tabular-nums">
                              {formatBRL(e.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan={5} className="p-2 text-right text-gray-600">
                            Total Despesas Operacionais:
                          </td>
                          <td className="p-2 text-right text-[#D5A34C]">
                            {formatBRL(monthlyFinancials.operationalExpensesTotal)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              )}

              {/* REPORT 4: INVENTÁRIO PATRIMONIAL */}
              {activeReport === 'patrimonio' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#153246] uppercase">
                      Inventário Geral do Patrimônio
                    </h2>
                    <p className="text-xs text-gray-500">
                      Relação de equipamentos, ferramentas e ativos cadastrados
                    </p>
                  </div>

                  {assets.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-gray-500">
                      Nenhum item patrimonial registrado.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Código</th>
                          <th className="p-2">Bem / Equipamento</th>
                          <th className="p-2">Categoria</th>
                          <th className="p-2">Classificação</th>
                          <th className="p-2 text-center">Qtd</th>
                          <th className="p-2 text-right">Valor Unitário</th>
                          <th className="p-2 text-right">Valor Total</th>
                          <th className="p-2">Localização</th>
                          <th className="p-2">Situação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {assets.map((a) => (
                          <tr key={a.id}>
                            <td className="p-2 font-bold text-[#153246]">{a.code}</td>
                            <td className="p-2 font-semibold">{a.name}</td>
                            <td className="p-2 text-gray-600">{a.category}</td>
                            <td className="p-2 font-semibold text-[#16836F]">{a.classification}</td>
                            <td className="p-2 text-center">{a.quantity}</td>
                            <td className="p-2 text-right text-gray-600">{formatBRL(a.unitValue)}</td>
                            <td className="p-2 text-right font-bold text-[#153246]">
                              {formatBRL(a.totalValue)}
                            </td>
                            <td className="p-2 text-gray-600">{a.location}</td>
                            <td className="p-2 text-gray-600">
                              {a.situation} ({a.conservationState})
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REPORT 5: PROSPECÇÃO E VISITAS */}
              {activeReport === 'prospeccao' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#153246] uppercase">
                      Relatório de Prospecção & Visitas Comerciais
                    </h2>
                    <p className="text-xs text-gray-500">
                      Pipeline de prospecções, agendamentos e retornos
                    </p>
                  </div>

                  {prospects.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-gray-500">
                      Nenhum registro de prospecção localizado.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Empresa</th>
                          <th className="p-2">Cidade/UF</th>
                          <th className="p-2">Contato / Tel</th>
                          <th className="p-2">Data Prev / Efetiva</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Próxima Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {prospects.map((p) => (
                          <tr key={p.id}>
                            <td className="p-2 font-bold">{p.companyName}</td>
                            <td className="p-2 text-gray-600">
                              {p.city}/{p.state}
                            </td>
                            <td className="p-2 text-gray-600">
                              <div>{p.contactName}</div>
                              <div className="text-[10px]">{p.phoneOrWhatsapp}</div>
                            </td>
                            <td className="p-2 text-gray-600">
                              <div>{p.scheduledDate ? formatDateBR(p.scheduledDate) : '—'}</div>
                              {p.actualDate && (
                                <div className="text-[10px] text-[#16836F] font-bold">
                                  Ef: {formatDateBR(p.actualDate)}
                                </div>
                              )}
                            </td>
                            <td className="p-2 font-semibold text-[#16836F]">{p.status}</td>
                            <td className="p-2 text-gray-600">
                              <div>{p.nextAction || '—'}</div>
                              {p.followUpDate && (
                                <div className="text-[10px] text-[#D5A34C]">
                                  Ret: {formatDateBR(p.followUpDate)}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REPORT 6: INVESTIMENTOS */}
              {activeReport === 'investimentos' && (
                <div className="space-y-4">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#153246] uppercase">
                      Plano Estratégico de Investimentos
                    </h2>
                    <p className="text-xs text-gray-500">
                      Mapeamento de equipamentos e ferramentas para aquisição futura
                    </p>
                  </div>

                  {investments.length === 0 ? (
                    <div className="p-8 border border-dashed rounded-xl text-center text-xs text-gray-500">
                      Nenhum investimento planejado cadastrado.
                    </div>
                  ) : (
                    <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                      <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                        <tr>
                          <th className="p-2">Item / Equipamento</th>
                          <th className="p-2">Descrição & Justificativa</th>
                          <th className="p-2 text-center">Qtd</th>
                          <th className="p-2 text-right">Valor Previsto</th>
                          <th className="p-2">Prioridade</th>
                          <th className="p-2">Status</th>
                          <th className="p-2">Previsão</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {investments.map((i) => (
                          <tr key={i.id}>
                            <td className="p-2 font-bold">{i.itemName}</td>
                            <td className="p-2 text-gray-600 max-w-xs">{i.description}</td>
                            <td className="p-2 text-center">{i.quantity}</td>
                            <td className="p-2 text-right font-bold text-[#D5A34C]">
                              {formatBRL(i.estimatedTotalValue)}
                            </td>
                            <td className="p-2 font-semibold text-[#B94949]">{i.priority}</td>
                            <td className="p-2 font-semibold text-[#16836F]">{i.status}</td>
                            <td className="p-2 text-gray-600">{formatDateBR(i.plannedDate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* REPORT 7: ORÇAMENTO COMERCIAL INDIVIDUAL */}
              {activeReport === 'orcamento' && currentBudgetToPrint && (
                <div className="space-y-6">
                  {/* Proposal Header */}
                  <div className="flex justify-between items-start border-b pb-4">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold text-[#16836F]">
                        Proposta Comercial Técnica
                      </span>
                      <h2 className="text-xl font-extrabold text-[#153246]">
                        {currentBudgetToPrint.code}
                      </h2>
                      <div className="text-xs text-gray-600 mt-1">
                        Emissão: {formatDateBR(currentBudgetToPrint.issueDate)} · Validade até:{' '}
                        {formatDateBR(currentBudgetToPrint.validUntil)}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#E4F4EF] text-[#16836F]">
                        {currentBudgetToPrint.status}
                      </span>
                    </div>
                  </div>

                  {/* Client Identification Box */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 text-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">
                        Contratante
                      </div>
                      <div className="font-bold text-sm text-[#153246]">
                        {currentBudgetToPrint.companyName}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-gray-400 uppercase font-bold">
                        Objeto da Proposta
                      </div>
                      <div className="font-semibold text-[#153246]">
                        {currentBudgetToPrint.serviceName}
                      </div>
                    </div>
                  </div>

                  {/* Scope description */}
                  {currentBudgetToPrint.description && (
                    <div className="text-xs text-gray-700 leading-relaxed">
                      <strong>Escopo Técnico:</strong> {currentBudgetToPrint.description}
                    </div>
                  )}

                  {/* Items Table */}
                  <table className="w-full text-xs text-left border border-gray-200 rounded-xl overflow-hidden">
                    <thead className="bg-gray-100 text-gray-600 text-[10px] uppercase font-bold">
                      <tr>
                        <th className="p-3">Item / Serviço</th>
                        <th className="p-3 text-center">Norma</th>
                        <th className="p-3 text-center">Participantes</th>
                        <th className="p-3 text-right">Valor Unitário</th>
                        <th className="p-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentBudgetToPrint.items.map((item) => (
                        <tr key={item.id}>
                          <td className="p-3 font-semibold text-[#153246]">
                            {item.serviceName}
                          </td>
                          <td className="p-3 text-center font-bold text-[#16836F]">
                            {item.nrCode || '—'}
                          </td>
                          <td className="p-3 text-center">{item.participants}</td>
                          <td className="p-3 text-right text-gray-600">
                            {formatBRL(item.unitPrice)}
                          </td>
                          <td className="p-3 text-right font-bold text-[#153246]">
                            {formatBRL(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-300">
                        <td colSpan={2} className="p-3 font-bold text-[#153246]">
                          TOTAL GERAL DA PROPOSTA:
                        </td>
                        <td className="p-3 text-center font-bold">
                          {currentBudgetToPrint.participantsTotal} alunos
                        </td>
                        <td className="p-3"></td>
                        <td className="p-3 text-right text-base font-extrabold text-[#16836F]">
                          {formatBRL(currentBudgetToPrint.totalValue)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>

                  {/* Commercial Conditions */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2 text-xs">
                    <h4 className="font-bold text-[#153246] uppercase text-[11px]">
                      Condições Comerciais e Operacionais
                    </h4>
                    <div>
                      <strong>Condições de Pagamento:</strong> {currentBudgetToPrint.paymentTerms}
                    </div>
                    {currentBudgetToPrint.expectedDate && (
                      <div>
                        <strong>Data Prevista para Execução:</strong>{' '}
                        {formatDateBR(currentBudgetToPrint.expectedDate)}
                      </div>
                    )}
                    {currentBudgetToPrint.commercialNotes && (
                      <div>
                        <strong>Observações:</strong> {currentBudgetToPrint.commercialNotes}
                      </div>
                    )}
                  </div>

                  {/* Signatures Block */}
                  <div className="pt-10 grid grid-cols-2 gap-8 text-center text-xs page-break-inside-avoid">
                    <div className="border-t border-gray-400 pt-2">
                      <div className="font-bold text-[#153246]">PROTEC SEG — TREINAMENTOS</div>
                      <div className="text-[10px] text-gray-500">Erik Coronado · Responsável Técnico</div>
                    </div>
                    <div className="border-t border-gray-400 pt-2">
                      <div className="font-bold text-[#153246]">
                        {currentBudgetToPrint.companyName}
                      </div>
                      <div className="text-[10px] text-gray-500">De Acordo / Assinatura do Cliente</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Footer */}
              <div className="pt-6 border-t border-gray-200 text-[10px] text-gray-400 flex justify-between items-center print:block">
                <span>Protec Seg — Sistema de Gestão Empresarial e de Treinamentos</span>
                <span>Documento emitido eletronicamente</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
