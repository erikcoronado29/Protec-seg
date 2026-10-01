export type ScreenId =
  | 'dashboard'
  | 'empresas'
  | 'orcamentos'
  | 'treinamentos'
  | 'prospeccao'
  | 'financeiro'
  | 'patrimonio'
  | 'investimentos'
  | 'relatorios'
  | 'configuracoes';

export type CompanyStatus = 'Ativa' | 'Inativa' | 'Prospect';

export interface Company {
  id: string;
  name: string;
  cnpj: string;
  contactName: string;
  phone: string;
  whatsapp?: string;
  email: string;
  address: string;
  city: string;
  state: string;
  cep: string;
  commercialRep: string;
  status: CompanyStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type BudgetStatus = 'Rascunho' | 'Enviado' | 'Aprovado' | 'Rejeitado';

export interface BudgetItem {
  id: string;
  serviceName: string;
  nrCode?: string;
  participants: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Budget {
  id: string;
  code: string; // e.g. "ORC-2026-001"
  companyId: string;
  companyName: string;
  issueDate: string; // YYYY-MM-DD
  validUntil: string;
  expectedDate?: string;
  serviceName: string;
  description: string;
  items: BudgetItem[];
  participantsTotal: number;
  totalValue: number;
  paymentTerms: string;
  commercialNotes?: string;
  status: BudgetStatus;
  createdAt: string;
  updatedAt: string;
}

export type TrainingStatus = 'Realizado' | 'Agendado' | 'Cancelado';

export interface TrainingInstructor {
  name: string;
  hours: number;
}

export interface Training {
  id: string;
  code: string; // e.g. "TRN-2026-001"
  companyId: string;
  companyName: string;
  title: string;
  nrNumber?: string;
  date: string; // YYYY-MM-DD
  participants: number;
  status: TrainingStatus;
  revenue: number; // billed to customer
  distanceKm: number; // total km travelled
  ratePerKmSnapshot: number; // historical km rate used
  travelCost: number; // distanceKm * ratePerKmSnapshot
  manHours: number; // total man hours
  ratePerHourSnapshot: number; // historical hourly rate used
  laborCost: number; // manHours * ratePerHourSnapshot
  otherCosts: number;
  otherCostsDescription?: string;
  totalDirectCost: number; // travelCost + laborCost + otherCosts
  directResult: number; // revenue - totalDirectCost
  marginPercent: number; // (directResult / revenue) * 100
  instructor: string;
  instructorsDetail?: TrainingInstructor[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProspectStatus = 'A visitar' | 'Visitada — atendida' | 'Visitada — não atendida';

export interface ProspectVisit {
  id: string;
  companyName: string;
  cnpj?: string;
  contactName: string;
  phoneOrWhatsapp: string;
  email?: string;
  city: string;
  state: string;
  address?: string;
  scheduledDate?: string;
  actualDate?: string;
  repName: string;
  status: ProspectStatus;
  notes?: string;
  nextAction?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
}

export type ExpenseCategory =
  | 'Administrativo'
  | 'Materiais'
  | 'Marketing'
  | 'Contabilidade'
  | 'Aluguel'
  | 'Software e sistemas'
  | 'Impostos e taxas'
  | 'Manutenção'
  | 'Deslocamentos não vinculados a treinamento'
  | 'Outros';

export type ExpenseFrequency = 'Recorrente' | 'Pontual';
export type ExpenseStatus = 'Pago' | 'Pendente';

export interface Expense {
  id: string;
  description: string;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  dueDate: string;
  paymentDate?: string;
  amount: number;
  frequency: ExpenseFrequency;
  status: ExpenseStatus;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type AssetCategory =
  | 'Equipamentos de treinamento'
  | 'Informática'
  | 'Veículos'
  | 'Ferramentas'
  | 'Mobiliário'
  | 'Equipamentos audiovisuais'
  | 'Material didático'
  | 'Obrigações financeiras'
  | 'Outros';

export type AssetClassification = 'Ativo' | 'Passivo' | 'Imobilizado';
export type AssetConservation = 'Novo' | 'Bom' | 'Regular' | 'Necessita Manutenção' | 'Sucata';
export type AssetSituation = 'Em uso' | 'Em manutenção' | 'Em aberto' | 'Quitado' | 'Baixado';

export interface Asset {
  id: string;
  code: string; // e.g. "PAT-001"
  name: string;
  category: AssetCategory;
  classification: AssetClassification;
  quantity: number;
  unitValue: number;
  totalValue: number; // quantity * unitValue
  acquisitionDate: string;
  supplier?: string;
  invoiceNumber?: string;
  location: string;
  responsible: string;
  conservationState: AssetConservation;
  situation: AssetSituation;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type InvestmentPriority = 'Alta' | 'Média' | 'Baixa';
export type InvestmentStatus = 'Planejado' | 'Em cotação' | 'Aprovado' | 'Adquirido';

export interface Investment {
  id: string;
  itemName: string;
  description: string;
  justification: string;
  quantity: number;
  estimatedUnitValue: number;
  estimatedTotalValue: number;
  priority: InvestmentPriority;
  registrationDate: string;
  plannedDate: string;
  supplierOrQuoteRef?: string;
  responsible: string;
  status: InvestmentStatus;
  actualCost?: number;
  actualPurchaseDate?: string;
  linkedAssetId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  ratePerKm: number; // default: 1.50
  ratePerHour: number; // default: 60.00
  shareProtecPercent: number; // default: 50
  shareErikPercent: number; // default: 50
  investmentReservePercent: number; // default: 0
  darkMode: boolean;
  isDemoData: boolean;
}

export interface MonthlyFinancialSummary {
  periodLabel: string;
  year: number;
  month: number;
  trainingsCompletedCount: number;
  participantsTotal: number;
  trainingRevenue: number;
  directCostsTotal: number;
  travelCostsTotal: number;
  laborCostsTotal: number;
  otherDirectCostsTotal: number;
  operationalExpensesTotal: number;
  paidExpensesTotal: number;
  pendingExpensesTotal: number;
  totalCosts: number; // directCostsTotal + operationalExpensesTotal
  netProfit: number; // trainingRevenue - totalCosts
  investmentReserve: number;
  distributableProfit: number;
  shareProtec: number;
  shareErik: number;
  hasLoss: boolean;
  isZero: boolean;
}
