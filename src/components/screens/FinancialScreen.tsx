import {
  AlertCircle,
  Building,
  Calendar,
  CheckCircle2,
  Clock,
  CreditCard,
  DollarSign,
  Edit2,
  Filter,
  Plus,
  Receipt,
  Search,
  Tag,
  Trash2,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Expense, ExpenseCategory, ExpenseFrequency, ExpenseStatus } from '../../types';
import { formatBRL, formatDateBR, MONTH_NAMES_PT } from '../../utils/finance';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const FinancialScreen: React.FC = () => {
  const {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    monthlyFinancials,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
    settings,
    addToast,
    setActiveScreen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('Todas');
  const [statusFilter, setStatusFilter] = useState<'Todas' | ExpenseStatus>('Todas');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const categories: ExpenseCategory[] = [
    'Administrativo',
    'Materiais',
    'Marketing',
    'Contabilidade',
    'Aluguel',
    'Software e sistemas',
    'Impostos e taxas',
    'Manutenção',
    'Deslocamentos não vinculados a treinamento',
    'Outros',
  ];

  const targetYM = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const [formData, setFormData] = useState({
    description: '',
    category: 'Administrativo' as ExpenseCategory,
    date: `${targetYM}-05`,
    dueDate: `${targetYM}-10`,
    paymentDate: `${targetYM}-10`,
    amount: 250.0,
    frequency: 'Recorrente' as ExpenseFrequency,
    status: 'Pago' as ExpenseStatus,
    paymentMethod: 'PIX',
    notes: '',
  });

  const openNewModal = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      category: 'Software e sistemas',
      date: `${targetYM}-05`,
      dueDate: `${targetYM}-10`,
      paymentDate: `${targetYM}-10`,
      amount: 150.0,
      frequency: 'Recorrente',
      status: 'Pago',
      paymentMethod: 'PIX',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      description: exp.description,
      category: exp.category,
      date: exp.date,
      dueDate: exp.dueDate,
      paymentDate: exp.paymentDate || '',
      amount: exp.amount,
      frequency: exp.frequency,
      status: exp.status,
      paymentMethod: exp.paymentMethod || 'PIX',
      notes: exp.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.description.trim()) {
      addToast('A descrição da despesa é obrigatória.', 'error');
      return;
    }

    if (formData.amount <= 0) {
      addToast('Informe um valor válido para a despesa.', 'error');
      return;
    }

    const payload = {
      description: formData.description,
      category: formData.category,
      date: formData.date,
      dueDate: formData.dueDate,
      paymentDate: formData.status === 'Pago' ? formData.paymentDate || formData.date : undefined,
      amount: Number(formData.amount) || 0,
      frequency: formData.frequency,
      status: formData.status,
      paymentMethod: formData.paymentMethod,
      notes: formData.notes,
    };

    if (editingExpense) {
      updateExpense(editingExpense.id, payload);
    } else {
      addExpense(payload);
    }

    setModalOpen(false);
  };

  // Filter current month expenses
  const filtered = expenses
    .filter((e) => e.date.startsWith(targetYM))
    .filter((e) => {
      const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'Todas' || e.category === categoryFilter;
      const matchesStatus = statusFilter === 'Todas' || e.status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });

  const {
    trainingRevenue,
    directCostsTotal,
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
    periodLabel,
  } = monthlyFinancials;

  return (
    <div className="space-y-6">
      {/* Financial KPIs Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Receita dos Treinamentos Realizados */}
        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Receita Realizada (Mês)
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#16836F] tabular-nums">
            {formatBRL(trainingRevenue)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Soma dos treinamentos com status "Realizado"
          </div>
        </div>

        {/* Custos Diretos Operacionais */}
        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Custos Diretos (Cursos)
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#D5A34C] tabular-nums">
            {formatBRL(directCostsTotal)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Deslocamento, horas-homem e materiais
          </div>
        </div>

        {/* Despesas Operacionais da Empresa */}
        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Despesas Operacionais
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#D5A34C] tabular-nums">
            {formatBRL(operationalExpensesTotal)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Sistemas, contabilidade, adm, impostos
          </div>
        </div>

        {/* Lucro Líquido Gerencial Estimado */}
        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Lucro Líquido Estimado
          </div>
          <div
            className={`text-xl sm:text-2xl font-extrabold tabular-nums ${
              hasLoss ? 'text-[#B94949]' : 'text-[#16836F]'
            }`}
          >
            {formatBRL(netProfit)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Receita − (Custos Diretos + Despesas)
          </div>
        </div>
      </div>

      {/* Cashflow Breakdown and Profit Distribution Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow conferência */}
        <div className="bg-white dark:bg-[#1B272F] p-5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E9EC] dark:border-[#34434C]">
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Fluxo das Despesas ({periodLabel})
            </h3>
            <span className="text-[11px] text-[#71818B]">Conferência</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16836F]" />
                <span className="text-[#20313C] dark:text-[#EDF3F5] font-semibold">
                  Despesas Pagas
                </span>
              </div>
              <span className="font-bold text-[#16836F] tabular-nums">
                {formatBRL(paidExpensesTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#D5A34C]" />
                <span className="text-[#20313C] dark:text-[#EDF3F5] font-semibold">
                  Despesas Pendentes
                </span>
              </div>
              <span className="font-bold text-[#D5A34C] tabular-nums">
                {formatBRL(pendingExpensesTotal)}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
              <span className="text-[#71818B]">Custo Mensal Consolidado:</span>
              <span className="font-extrabold text-[#D5A34C] tabular-nums">
                {formatBRL(totalCosts)}
              </span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#E4F4EF] dark:bg-[#16836F]/10 text-[10px] text-[#153246] dark:text-[#E4F4EF]">
            <strong>Regra de competência:</strong> Todas as despesas cadastradas neste mês compõem o
            resultado gerencial do período, mantendo a distinção rigorosa com os custos diretos.
          </div>
        </div>

        {/* Divisão dos Resultados */}
        <div className="lg:col-span-2 bg-white dark:bg-[#1B272F] p-5 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-[#E2E9EC] dark:border-[#34434C]">
            <div>
              <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
                Distribuição Gerencial do Resultado
              </h3>
              <p className="text-[11px] text-[#71818B]">
                Divisão dos resultados entre Protec Seg e Erik Coronado
              </p>
            </div>
            <button
              onClick={() => setActiveScreen('configuracoes')}
              className="text-xs font-semibold text-[#16836F] hover:underline"
            >
              Configurar regras
            </button>
          </div>

          {hasLoss ? (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 text-xs text-[#B94949]">
              <strong>Resultado negativo ({formatBRL(netProfit)}):</strong> Em períodos com déficit
              ou sem lucro líquido positivo, não há distribuição de valores entre as partes.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
                <div className="text-[11px] text-[#71818B] mb-1">
                  Reserva p/ Investimentos ({settings.investmentReservePercent}%)
                </div>
                <div className="text-lg font-bold text-[#D5A34C] tabular-nums">
                  {formatBRL(investmentReserve)}
                </div>
                <div className="text-[10px] text-[#71818B] mt-0.5">Retido na empresa</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
                <div className="text-[11px] text-[#71818B] mb-1">
                  Protec Seg ({settings.shareProtecPercent}%)
                </div>
                <div className="text-lg font-extrabold text-[#16836F] tabular-nums">
                  {formatBRL(shareProtec)}
                </div>
                <div className="text-[10px] text-[#71818B] mt-0.5">Participação societária</div>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
                <div className="text-[11px] text-[#71818B] mb-1">
                  Erik Coronado ({settings.shareErikPercent}%)
                </div>
                <div className="text-lg font-extrabold text-[#16836F] tabular-nums">
                  {formatBRL(shareErik)}
                </div>
                <div className="text-[10px] text-[#71818B] mt-0.5">Participação do responsável</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Operational Expenses CRUD Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-[#E2E9EC] dark:border-[#34434C] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Despesas Operacionais ({periodLabel})
            </h3>
            <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
              Cadastre despesas administrativas, ferramentas, softwares e obrigações do mês
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openNewModal}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova despesa</span>
            </button>
          </div>
        </div>

        {/* Filter bar for expenses */}
        <div className="p-3 border-b border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] flex flex-wrap gap-2 text-xs items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar despesa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-white dark:bg-[#1B272F] text-[#20313C] dark:text-[#EDF3F5] outline-hidden"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-white dark:bg-[#1B272F] text-[#20313C] dark:text-[#EDF3F5]"
          >
            <option value="Todas">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="text-xs p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-white dark:bg-[#1B272F] text-[#20313C] dark:text-[#EDF3F5]"
          >
            <option value="Todas">Todos os status</option>
            <option value="Pago">Pago</option>
            <option value="Pendente">Pendente</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#71818B] dark:text-[#A8B6BE]">
            <Receipt className="w-8 h-8 mx-auto mb-2 text-[#71818B]/50" />
            Nenhuma despesa operacional registrada para este mês ({periodLabel}).
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Descrição da Despesa</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Data / Vencimento</th>
                  <th className="py-3 px-4">Frequência</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((exp) => {
                  const isPaid = exp.status === 'Pago';

                  return (
                    <tr
                      key={exp.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div>{exp.description}</div>
                        {exp.paymentMethod && (
                          <div className="text-[10px] text-[#71818B]">
                            Pagamento: {exp.paymentMethod}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-sm bg-[#F4F7F8] dark:bg-[#202E37] text-[11px] font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        <div>Lançamento: {formatDateBR(exp.date)}</div>
                        <div className="text-[10px] text-[#71818B]">
                          Vencimento: {formatDateBR(exp.dueDate)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] whitespace-nowrap">
                        {exp.frequency}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#D5A34C] tabular-nums whitespace-nowrap">
                        {formatBRL(exp.amount)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isPaid ? 'text-[#16836F]' : 'text-[#D5A34C]'
                          }`}
                        >
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar despesa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(exp)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir despesa"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Cadastro de Despesa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[#D5A34C] flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  {editingExpense ? 'Editar Despesa Operacional' : 'Cadastrar Despesa Operacional'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#71818B] hover:text-[#20313C] dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                  Descrição da Despesa *
                </label>
                <input
                  type="text"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Assinatura de Software SST / Honorários Contábeis"
                  className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as ExpenseCategory })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Valor (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0.01}
                    required
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#D5A34C] font-bold text-sm tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data do Lançamento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data de Vencimento *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Frequência
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        frequency: e.target.value as ExpenseFrequency,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Recorrente">Recorrente</option>
                    <option value="Pontual">Pontual</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Status do Pagamento
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as ExpenseStatus,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-semibold outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Pago">Pago</option>
                    <option value="Pendente">Pendente</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Forma de Pagamento
                  </label>
                  <input
                    type="text"
                    value={formData.paymentMethod}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    placeholder="PIX, Boleto, Cartão"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                {formData.status === 'Pago' && (
                  <div>
                    <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                      Data do Pagamento Efetivo
                    </label>
                    <input
                      type="date"
                      value={formData.paymentDate}
                      onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                  Observações
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Número de nota fiscal, justificativa ou fornecedor."
                  className="w-full p-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E9EC] dark:border-[#34434C] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-[#71818B] hover:text-[#20313C] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white font-bold transition-colors"
                >
                  {editingExpense ? 'Salvar Despesa' : 'Cadastrar Despesa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Despesa"
        message={`Tem certeza que deseja excluir a despesa "${deleteTarget?.description}" no valor de ${formatBRL(
          deleteTarget?.amount
        )}?`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteExpense(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
