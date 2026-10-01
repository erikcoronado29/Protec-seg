import {
  AppSettings,
  Expense,
  MonthlyFinancialSummary,
  Training,
} from '../types';

/**
 * Format currency into standard Brazilian Real format: "R$ 1.234,56"
 */
export function formatBRL(value: number | undefined | null): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format numeric value with 2 decimal places in pt-BR
 */
export function formatNumberBR(value: number | undefined | null): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Format ISO date string (YYYY-MM-DD) into DD/MM/AAAA
 */
export function formatDateBR(dateStr: string | undefined | null): string {
  if (!dateStr) return '—';
  // Handle YYYY-MM-DD
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [year, month, day] = parts;
    return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
  }
  return dateStr;
}

/**
 * Get current year-month string: "YYYY-MM"
 */
export function getCurrentYearMonth(): { year: number; month: number } {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1, // 1 to 12
  };
}

/**
 * Month names in Portuguese
 */
export const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTH_NAMES_SHORT_PT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
];

/**
 * Calculate training direct costs and estimated result
 */
export function calculateTrainingCosts(
  distanceKm: number,
  ratePerKm: number,
  manHours: number,
  ratePerHour: number,
  otherCosts: number,
  revenue: number
) {
  const km = Math.max(0, Number(distanceKm) || 0);
  const rKm = Math.max(0, Number(ratePerKm) || 0);
  const hours = Math.max(0, Number(manHours) || 0);
  const rHour = Math.max(0, Number(ratePerHour) || 0);
  const others = Math.max(0, Number(otherCosts) || 0);
  const rev = Math.max(0, Number(revenue) || 0);

  const travelCost = Number((km * rKm).toFixed(2));
  const laborCost = Number((hours * rHour).toFixed(2));
  const totalDirectCost = Number((travelCost + laborCost + others).toFixed(2));
  const directResult = Number((rev - totalDirectCost).toFixed(2));
  const marginPercent = rev > 0 ? Number(((directResult / rev) * 100).toFixed(1)) : 0;

  return {
    travelCost,
    laborCost,
    totalDirectCost,
    directResult,
    marginPercent,
  };
}

/**
 * Calculate monthly financial metrics
 */
export function calculateMonthlyFinancials(
  trainings: Training[],
  expenses: Expense[],
  year: number,
  month: number,
  settings: AppSettings
): MonthlyFinancialSummary {
  const targetYearMonth = `${year}-${String(month).padStart(2, '0')}`;

  // Filter completed trainings in this month
  const monthlyCompletedTrainings = trainings.filter(
    (t) => t.status === 'Realizado' && t.date.startsWith(targetYearMonth)
  );

  const trainingsCompletedCount = monthlyCompletedTrainings.length;
  const participantsTotal = monthlyCompletedTrainings.reduce(
    (sum, t) => sum + (t.participants || 0),
    0
  );
  const trainingRevenue = monthlyCompletedTrainings.reduce(
    (sum, t) => sum + (t.revenue || 0),
    0
  );
  const travelCostsTotal = monthlyCompletedTrainings.reduce(
    (sum, t) => sum + (t.travelCost || 0),
    0
  );
  const laborCostsTotal = monthlyCompletedTrainings.reduce(
    (sum, t) => sum + (t.laborCost || 0),
    0
  );
  const otherDirectCostsTotal = monthlyCompletedTrainings.reduce(
    (sum, t) => sum + (t.otherCosts || 0),
    0
  );
  const directCostsTotal = monthlyCompletedTrainings.reduce(
    (sum, t) => sum + (t.totalDirectCost || 0),
    0
  );

  // Filter expenses belonging to this month
  const monthlyExpenses = expenses.filter((e) => e.date.startsWith(targetYearMonth));

  const operationalExpensesTotal = monthlyExpenses.reduce(
    (sum, e) => sum + (e.amount || 0),
    0
  );
  const paidExpensesTotal = monthlyExpenses
    .filter((e) => e.status === 'Pago')
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const pendingExpensesTotal = monthlyExpenses
    .filter((e) => e.status === 'Pendente')
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const totalCosts = Number((directCostsTotal + operationalExpensesTotal).toFixed(2));
  const netProfit = Number((trainingRevenue - totalCosts).toFixed(2));

  let investmentReserve = 0;
  let distributableProfit = 0;
  let shareProtec = 0;
  let shareErik = 0;

  const hasLoss = netProfit < 0;
  const isZero = netProfit === 0;

  if (netProfit > 0) {
    const reserveRate = (settings.investmentReservePercent || 0) / 100;
    investmentReserve = Number((netProfit * reserveRate).toFixed(2));
    distributableProfit = Number((netProfit - investmentReserve).toFixed(2));

    const protecRate = (settings.shareProtecPercent || 50) / 100;
    const erikRate = (settings.shareErikPercent || 50) / 100;

    shareProtec = Number((distributableProfit * protecRate).toFixed(2));
    shareErik = Number((distributableProfit * erikRate).toFixed(2));
  }

  const periodLabel = `${MONTH_NAMES_PT[month - 1]} de ${year}`;

  return {
    periodLabel,
    year,
    month,
    trainingsCompletedCount,
    participantsTotal,
    trainingRevenue,
    directCostsTotal,
    travelCostsTotal,
    laborCostsTotal,
    otherDirectCostsTotal,
    operationalExpensesTotal,
    paidExpensesTotal,
    pendingExpensesTotal,
    totalCosts,
    netProfit,
    investmentReserve,
    distributableProfit,
    shareProtec,
    shareErik,
    hasLoss,
    isZero,
  };
}

/**
 * Get 6-month historical series for the bar chart
 */
export function getSixMonthsFinancialSeries(
  trainings: Training[],
  expenses: Expense[],
  endYear: number,
  endMonth: number
) {
  const result: {
    label: string;
    shortLabel: string;
    yearMonth: string;
    revenue: number;
    totalCosts: number;
    netProfit: number;
  }[] = [];

  for (let i = 5; i >= 0; i--) {
    let y = endYear;
    let m = endMonth - i;
    while (m <= 0) {
      m += 12;
      y -= 1;
    }

    const ym = `${y}-${String(m).padStart(2, '0')}`;
    const label = `${MONTH_NAMES_SHORT_PT[m - 1]}/${String(y).slice(-2)}`;
    const fullLabel = `${MONTH_NAMES_PT[m - 1]} ${y}`;

    // Completed trainings in this month
    const mTrainings = trainings.filter(
      (t) => t.status === 'Realizado' && t.date.startsWith(ym)
    );
    const revenue = mTrainings.reduce((sum, t) => sum + (t.revenue || 0), 0);
    const directCosts = mTrainings.reduce((sum, t) => sum + (t.totalDirectCost || 0), 0);

    // Operational expenses in this month
    const mExpenses = expenses.filter((e) => e.date.startsWith(ym));
    const opExpenses = mExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalCosts = Number((directCosts + opExpenses).toFixed(2));
    const netProfit = Number((revenue - totalCosts).toFixed(2));

    result.push({
      label: fullLabel,
      shortLabel: label,
      yearMonth: ym,
      revenue,
      totalCosts,
      netProfit,
    });
  }

  return result;
}
