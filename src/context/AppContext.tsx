import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getInitialData } from '../data/initialData';
import {
  AppSettings,
  Asset,
  Budget,
  Company,
  Expense,
  Investment,
  MonthlyFinancialSummary,
  ProspectVisit,
  ScreenId,
  Training,
} from '../types';
import {
  calculateMonthlyFinancials,
  calculateTrainingCosts,
  getCurrentYearMonth,
} from '../utils/finance';

const STORAGE_KEY = 'protec_seg_app_data_v1';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface AppContextType {
  activeScreen: ScreenId;
  setActiveScreen: (screen: ScreenId) => void;
  selectedYear: number;
  selectedMonth: number;
  setSelectedPeriod: (year: number, month: number) => void;

  // Entities
  companies: Company[];
  budgets: Budget[];
  trainings: Training[];
  expenses: Expense[];
  assets: Asset[];
  prospects: ProspectVisit[];
  investments: Investment[];
  settings: AppSettings;

  // Calculated
  monthlyFinancials: MonthlyFinancialSummary;

  // Companies
  addCompany: (company: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; id?: string };
  updateCompany: (id: string, company: Partial<Company>) => boolean;
  deleteCompany: (id: string) => { success: boolean; reason?: string; linkedCount?: number };
  inactivateCompany: (id: string) => boolean;

  // Budgets
  addBudget: (budget: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; id?: string };
  updateBudget: (id: string, budget: Partial<Budget>) => boolean;
  deleteBudget: (id: string) => boolean;
  duplicateBudget: (id: string) => boolean;

  // Trainings
  addTraining: (training: Omit<Training, 'id' | 'createdAt' | 'updatedAt' | 'travelCost' | 'laborCost' | 'totalDirectCost' | 'directResult' | 'marginPercent'> & {
    ratePerKmSnapshot?: number;
    ratePerHourSnapshot?: number;
  }) => { success: boolean; id?: string };
  updateTraining: (id: string, training: Partial<Training>) => boolean;
  deleteTraining: (id: string) => boolean;

  // Prospects
  addProspect: (prospect: Omit<ProspectVisit, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; id?: string };
  updateProspect: (id: string, prospect: Partial<ProspectVisit>) => boolean;
  deleteProspect: (id: string) => boolean;

  // Expenses
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; id?: string };
  updateExpense: (id: string, expense: Partial<Expense>) => boolean;
  deleteExpense: (id: string) => boolean;

  // Assets
  addAsset: (asset: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'totalValue'>) => { success: boolean; id?: string };
  updateAsset: (id: string, asset: Partial<Asset>) => boolean;
  deleteAsset: (id: string) => boolean;

  // Investments
  addInvestment: (investment: Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'estimatedTotalValue'>) => { success: boolean; id?: string };
  updateInvestment: (id: string, investment: Partial<Investment>) => boolean;
  deleteInvestment: (id: string) => boolean;
  markInvestmentAcquired: (id: string, actualCost: number, actualPurchaseDate: string, registerInAssets: boolean) => boolean;

  // Settings & System
  updateSettings: (newSettings: Partial<AppSettings>) => boolean;
  resetToDemo: () => void;
  clearAllData: () => void;
  exportBackup: () => void;
  importBackup: (jsonText: string) => { success: boolean; message: string };

  // Toasts
  toasts: ToastMessage[];
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;

  // UI Flow modals
  modalNewTrainingOpen: boolean;
  setModalNewTrainingOpen: (open: boolean) => void;
  trainingPrefill: Partial<Training> | null;
  setTrainingPrefill: (data: Partial<Training> | null) => void;

  selectedBudgetForPrint: Budget | null;
  setSelectedBudgetForPrint: (b: Budget | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentYM = getCurrentYearMonth();
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [selectedYear, setSelectedYear] = useState<number>(currentYM.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(currentYM.month);

  // Modals & Navigation helpers
  const [modalNewTrainingOpen, setModalNewTrainingOpen] = useState(false);
  const [trainingPrefill, setTrainingPrefill] = useState<Partial<Training> | null>(null);
  const [selectedBudgetForPrint, setSelectedBudgetForPrint] = useState<Budget | null>(null);

  // Initialize data from LocalStorage or Initial Demo
  const [dataLoaded, setDataLoaded] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [trainings, setTrainings] = useState<Training[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [prospects, setProspects] = useState<ProspectVisit[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [settings, setSettings] = useState<AppSettings>(getInitialData().settings);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Load from LocalStorage once on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.companies && parsed.trainings) {
          setCompanies(parsed.companies);
          setBudgets(parsed.budgets || []);
          setTrainings(parsed.trainings || []);
          setExpenses(parsed.expenses || []);
          setAssets(parsed.assets || []);
          setProspects(parsed.prospects || []);
          setInvestments(parsed.investments || []);
          setSettings(parsed.settings || getInitialData().settings);
          setDataLoaded(true);
          return;
        }
      }
    } catch (err) {
      console.error('Error reading localStorage, using initial dataset', err);
    }

    // Default to demo dataset
    const initial = getInitialData();
    setCompanies(initial.companies);
    setBudgets(initial.budgets);
    setTrainings(initial.trainings);
    setExpenses(initial.expenses);
    setAssets(initial.assets);
    setProspects(initial.prospects);
    setInvestments(initial.investments);
    setSettings(initial.settings);
    setDataLoaded(true);
  }, []);

  // Save changes to LocalStorage
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const payload = {
        companies,
        budgets,
        trainings,
        expenses,
        assets,
        prospects,
        investments,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (err) {
      console.error('Failed to write to localStorage', err);
    }
  }, [
    dataLoaded,
    companies,
    budgets,
    trainings,
    expenses,
    assets,
    prospects,
    investments,
    settings,
  ]);

  // Dark mode effect
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  const setSelectedPeriod = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
  };

  // Calculated Monthly Financials
  const monthlyFinancials = useMemo(() => {
    return calculateMonthlyFinancials(
      trainings,
      expenses,
      selectedYear,
      selectedMonth,
      settings
    );
  }, [trainings, expenses, selectedYear, selectedMonth, settings]);

  // ================= COMPANY CRUD =================
  const addCompany = (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `comp-${Date.now()}`;
    const now = new Date().toISOString();
    const newCompany: Company = {
      ...companyData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setCompanies((prev) => [newCompany, ...prev]);
    addToast(`Empresa "${newCompany.name}" cadastrada com sucesso!`, 'success');
    return { success: true, id };
  };

  const updateCompany = (id: string, updates: Partial<Company>) => {
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      )
    );
    // If company name was updated, update in referenced budgets & trainings
    if (updates.name) {
      setBudgets((prev) =>
        prev.map((b) => (b.companyId === id ? { ...b, companyName: updates.name! } : b))
      );
      setTrainings((prev) =>
        prev.map((t) => (t.companyId === id ? { ...t, companyName: updates.name! } : t))
      );
    }
    addToast('Dados da empresa atualizados com sucesso.', 'success');
    return true;
  };

  const deleteCompany = (id: string) => {
    // Check if referenced in budgets or trainings
    const linkedBudgets = budgets.filter((b) => b.companyId === id);
    const linkedTrainings = trainings.filter((t) => t.companyId === id);
    const linkedCount = linkedBudgets.length + linkedTrainings.length;

    if (linkedCount > 0) {
      addToast(
        `Esta empresa possui ${linkedCount} registro(s) vinculado(s) (orçamentos/treinamentos). Recomenda-se inativar o cadastro.`,
        'error'
      );
      return {
        success: false,
        reason: 'linked_records',
        linkedCount,
      };
    }

    setCompanies((prev) => prev.filter((c) => c.id !== id));
    addToast('Empresa excluída do sistema.', 'info');
    return { success: true };
  };

  const inactivateCompany = (id: string) => {
    return updateCompany(id, { status: 'Inativa' });
  };

  // ================= BUDGET CRUD =================
  const addBudget = (budgetData: Omit<Budget, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `bud-${Date.now()}`;
    const now = new Date().toISOString();
    const newBudget: Budget = {
      ...budgetData,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setBudgets((prev) => [newBudget, ...prev]);
    addToast(`Orçamento ${newBudget.code} gerado com sucesso!`, 'success');
    return { success: true, id };
  };

  const updateBudget = (id: string, updates: Partial<Budget>) => {
    setBudgets((prev) =>
      prev.map((b) =>
        b.id === id ? { ...b, ...updates, updatedAt: new Date().toISOString() } : b
      )
    );
    addToast('Orçamento atualizado.', 'success');
    return true;
  };

  const deleteBudget = (id: string) => {
    setBudgets((prev) => prev.filter((b) => b.id !== id));
    addToast('Orçamento excluído.', 'info');
    return true;
  };

  const duplicateBudget = (id: string) => {
    const original = budgets.find((b) => b.id === id);
    if (!original) return false;

    const count = budgets.length + 1;
    const newCode = `ORC-${new Date().getFullYear()}-${String(count).padStart(3, '0')}`;
    const now = new Date().toISOString();
    const duplicated: Budget = {
      ...original,
      id: `bud-${Date.now()}`,
      code: newCode,
      status: 'Rascunho',
      issueDate: new Date().toISOString().split('T')[0],
      createdAt: now,
      updatedAt: now,
    };

    setBudgets((prev) => [duplicated, ...prev]);
    addToast(`Orçamento duplicado como ${newCode} (Rascunho).`, 'success');
    return true;
  };

  // ================= TRAINING CRUD =================
  const addTraining = (
    trainingInput: Omit<
      Training,
      | 'id'
      | 'createdAt'
      | 'updatedAt'
      | 'travelCost'
      | 'laborCost'
      | 'totalDirectCost'
      | 'directResult'
      | 'marginPercent'
    > & {
      ratePerKmSnapshot?: number;
      ratePerHourSnapshot?: number;
    }
  ) => {
    const id = `trn-${Date.now()}`;
    const now = new Date().toISOString();

    const rateKm = trainingInput.ratePerKmSnapshot ?? settings.ratePerKm;
    const rateHour = trainingInput.ratePerHourSnapshot ?? settings.ratePerHour;

    const calculated = calculateTrainingCosts(
      trainingInput.distanceKm,
      rateKm,
      trainingInput.manHours,
      rateHour,
      trainingInput.otherCosts,
      trainingInput.revenue
    );

    const newTraining: Training = {
      ...trainingInput,
      id,
      ratePerKmSnapshot: rateKm,
      ratePerHourSnapshot: rateHour,
      travelCost: calculated.travelCost,
      laborCost: calculated.laborCost,
      totalDirectCost: calculated.totalDirectCost,
      directResult: calculated.directResult,
      marginPercent: calculated.marginPercent,
      createdAt: now,
      updatedAt: now,
    };

    setTrainings((prev) => [newTraining, ...prev]);
    addToast(`Treinamento "${newTraining.title}" cadastrado com sucesso!`, 'success');
    return { success: true, id };
  };

  const updateTraining = (id: string, updates: Partial<Training>) => {
    setTrainings((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;

        const merged = { ...t, ...updates };
        const rateKm = merged.ratePerKmSnapshot ?? settings.ratePerKm;
        const rateHour = merged.ratePerHourSnapshot ?? settings.ratePerHour;

        const calculated = calculateTrainingCosts(
          merged.distanceKm,
          rateKm,
          merged.manHours,
          rateHour,
          merged.otherCosts,
          merged.revenue
        );

        return {
          ...merged,
          travelCost: calculated.travelCost,
          laborCost: calculated.laborCost,
          totalDirectCost: calculated.totalDirectCost,
          directResult: calculated.directResult,
          marginPercent: calculated.marginPercent,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('Treinamento e custos recalculados com sucesso.', 'success');
    return true;
  };

  const deleteTraining = (id: string) => {
    setTrainings((prev) => prev.filter((t) => t.id !== id));
    addToast('Treinamento excluído.', 'info');
    return true;
  };

  // ================= PROSPECT CRUD =================
  const addProspect = (data: Omit<ProspectVisit, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `pro-${Date.now()}`;
    const now = new Date().toISOString();
    const newProspect: ProspectVisit = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setProspects((prev) => [newProspect, ...prev]);
    addToast(`Prospecção para "${newProspect.companyName}" registrada.`, 'success');
    return { success: true, id };
  };

  const updateProspect = (id: string, updates: Partial<ProspectVisit>) => {
    setProspects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      )
    );
    addToast('Registro de visita/prospecção atualizado.', 'success');
    return true;
  };

  const deleteProspect = (id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id));
    addToast('Registro de prospecção excluído.', 'info');
    return true;
  };

  // ================= EXPENSES CRUD =================
  const addExpense = (data: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = `exp-${Date.now()}`;
    const now = new Date().toISOString();
    const newExpense: Expense = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addToast(`Despesa "${newExpense.description}" registrada.`, 'success');
    return { success: true, id };
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
      )
    );
    addToast('Despesa atualizada.', 'success');
    return true;
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast('Despesa excluída.', 'info');
    return true;
  };

  // ================= ASSETS CRUD =================
  const addAsset = (data: Omit<Asset, 'id' | 'createdAt' | 'updatedAt' | 'totalValue'>) => {
    const id = `ast-${Date.now()}`;
    const now = new Date().toISOString();
    const totalValue = Number(((data.quantity || 1) * (data.unitValue || 0)).toFixed(2));
    const newAsset: Asset = {
      ...data,
      id,
      totalValue,
      createdAt: now,
      updatedAt: now,
    };
    setAssets((prev) => [newAsset, ...prev]);
    addToast(`Item patrimonial "${newAsset.name}" registrado com sucesso.`, 'success');
    return { success: true, id };
  };

  const updateAsset = (id: string, updates: Partial<Asset>) => {
    setAssets((prev) =>
      prev.map((a) => {
        if (a.id !== id) return a;
        const merged = { ...a, ...updates };
        const totalValue = Number(((merged.quantity || 1) * (merged.unitValue || 0)).toFixed(2));
        return {
          ...merged,
          totalValue,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('Item patrimonial atualizado.', 'success');
    return true;
  };

  const deleteAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    addToast('Item patrimonial excluído.', 'info');
    return true;
  };

  // ================= INVESTMENTS CRUD =================
  const addInvestment = (
    data: Omit<Investment, 'id' | 'createdAt' | 'updatedAt' | 'estimatedTotalValue'>
  ) => {
    const id = `inv-${Date.now()}`;
    const now = new Date().toISOString();
    const estimatedTotalValue = Number(
      ((data.quantity || 1) * (data.estimatedUnitValue || 0)).toFixed(2)
    );
    const newInv: Investment = {
      ...data,
      id,
      estimatedTotalValue,
      createdAt: now,
      updatedAt: now,
    };
    setInvestments((prev) => [newInv, ...prev]);
    addToast(`Investimento planejado "${newInv.itemName}" registrado.`, 'success');
    return { success: true, id };
  };

  const updateInvestment = (id: string, updates: Partial<Investment>) => {
    setInvestments((prev) =>
      prev.map((inv) => {
        if (inv.id !== id) return inv;
        const merged = { ...inv, ...updates };
        const estimatedTotalValue = Number(
          ((merged.quantity || 1) * (merged.estimatedUnitValue || 0)).toFixed(2)
        );
        return {
          ...merged,
          estimatedTotalValue,
          updatedAt: new Date().toISOString(),
        };
      })
    );
    addToast('Investimento atualizado.', 'success');
    return true;
  };

  const deleteInvestment = (id: string) => {
    setInvestments((prev) => prev.filter((i) => i.id !== id));
    addToast('Investimento excluído.', 'info');
    return true;
  };

  const markInvestmentAcquired = (
    id: string,
    actualCost: number,
    actualPurchaseDate: string,
    registerInAssets: boolean
  ) => {
    const inv = investments.find((i) => i.id === id);
    if (!inv) return false;

    let assetId: string | undefined;

    if (registerInAssets) {
      const astCode = `PAT-${String(assets.length + 1).padStart(3, '0')}`;
      const now = new Date().toISOString();
      const unitVal = inv.quantity > 0 ? actualCost / inv.quantity : actualCost;
      const newAsset: Asset = {
        id: `ast-${Date.now()}`,
        code: astCode,
        name: inv.itemName,
        category: 'Equipamentos de treinamento',
        classification: 'Ativo',
        quantity: inv.quantity,
        unitValue: Number(unitVal.toFixed(2)),
        totalValue: actualCost,
        acquisitionDate: actualPurchaseDate,
        supplier: inv.supplierOrQuoteRef,
        location: 'Sede Operacional',
        responsible: inv.responsible,
        conservationState: 'Novo',
        situation: 'Em uso',
        notes: `Adquirido através do investimento: ${inv.description}`,
        createdAt: now,
        updatedAt: now,
      };
      setAssets((prev) => [newAsset, ...prev]);
      assetId = newAsset.id;
    }

    setInvestments((prev) =>
      prev.map((i) =>
        i.id === id
          ? {
              ...i,
              status: 'Adquirido',
              actualCost,
              actualPurchaseDate,
              linkedAssetId: assetId,
              updatedAt: new Date().toISOString(),
            }
          : i
      )
    );

    addToast(
      `Investimento "${inv.itemName}" marcado como Adquirido!${
        registerInAssets ? ' Bem incorporado ao Patrimônio.' : ''
      }`,
      'success'
    );
    return true;
  };

  // ================= SETTINGS & BACKUP =================
  const updateSettings = (newSettings: Partial<AppSettings>) => {
    // Validate share sum if updating shares
    const pShare =
      newSettings.shareProtecPercent !== undefined
        ? newSettings.shareProtecPercent
        : settings.shareProtecPercent;
    const eShare =
      newSettings.shareErikPercent !== undefined
        ? newSettings.shareErikPercent
        : settings.shareErikPercent;

    if (Number(pShare) + Number(eShare) !== 100) {
      addToast('A soma da participação da Protec Seg e do Erik Coronado deve ser 100%.', 'error');
      return false;
    }

    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast('Configurações salvas com sucesso.', 'success');
    return true;
  };

  const resetToDemo = () => {
    const initial = getInitialData();
    setCompanies(initial.companies);
    setBudgets(initial.budgets);
    setTrainings(initial.trainings);
    setExpenses(initial.expenses);
    setAssets(initial.assets);
    setProspects(initial.prospects);
    setInvestments(initial.investments);
    setSettings(initial.settings);
    addToast('Dados demonstrativos restaurados com sucesso.', 'info');
  };

  const clearAllData = () => {
    setCompanies([]);
    setBudgets([]);
    setTrainings([]);
    setExpenses([]);
    setAssets([]);
    setProspects([]);
    setInvestments([]);
    setSettings((prev) => ({ ...prev, isDemoData: false }));
    addToast('Todos os registros foram apagados. Base limpa iniciada.', 'info');
  };

  const exportBackup = () => {
    const backupObj = {
      exportVersion: '1.0',
      exportDate: new Date().toISOString(),
      appName: 'Protec Seg — Gestão de Treinamentos',
      companies,
      budgets,
      trainings,
      expenses,
      assets,
      prospects,
      investments,
      settings,
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `backup-protec-seg-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Arquivo de backup exportado com sucesso.', 'success');
  };

  const importBackup = (jsonText: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonText);
      if (!parsed || !Array.isArray(parsed.companies) || !Array.isArray(parsed.trainings)) {
        return {
          success: false,
          message: 'Arquivo inválido: estrutura de dados incompatível com o sistema Protec Seg.',
        };
      }

      setCompanies(parsed.companies);
      setBudgets(Array.isArray(parsed.budgets) ? parsed.budgets : []);
      setTrainings(Array.isArray(parsed.trainings) ? parsed.trainings : []);
      setExpenses(Array.isArray(parsed.expenses) ? parsed.expenses : []);
      setAssets(Array.isArray(parsed.assets) ? parsed.assets : []);
      setProspects(Array.isArray(parsed.prospects) ? parsed.prospects : []);
      setInvestments(Array.isArray(parsed.investments) ? parsed.investments : []);
      if (parsed.settings) {
        setSettings(parsed.settings);
      }

      addToast('Backup restaurado com sucesso! Todos os dados foram atualizados.', 'success');
      return { success: true, message: 'Backup importado com sucesso.' };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Falha ao processar arquivo JSON: ${errMsg}`,
      };
    }
  };

  return (
    <AppContext.Provider
      value={{
        activeScreen,
        setActiveScreen,
        selectedYear,
        selectedMonth,
        setSelectedPeriod,

        companies,
        budgets,
        trainings,
        expenses,
        assets,
        prospects,
        investments,
        settings,

        monthlyFinancials,

        addCompany,
        updateCompany,
        deleteCompany,
        inactivateCompany,

        addBudget,
        updateBudget,
        deleteBudget,
        duplicateBudget,

        addTraining,
        updateTraining,
        deleteTraining,

        addProspect,
        updateProspect,
        deleteProspect,

        addExpense,
        updateExpense,
        deleteExpense,

        addAsset,
        updateAsset,
        deleteAsset,

        addInvestment,
        updateInvestment,
        deleteInvestment,
        markInvestmentAcquired,

        updateSettings,
        resetToDemo,
        clearAllData,
        exportBackup,
        importBackup,

        toasts,
        addToast,
        removeToast,

        modalNewTrainingOpen,
        setModalNewTrainingOpen,
        trainingPrefill,
        setTrainingPrefill,

        selectedBudgetForPrint,
        setSelectedBudgetForPrint,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
