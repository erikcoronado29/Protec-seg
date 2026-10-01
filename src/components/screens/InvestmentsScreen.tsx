import {
  AlertCircle,
  Archive,
  ArrowRight,
  Boxes,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit2,
  FileCheck,
  Plus,
  Search,
  ShoppingCart,
  Trash2,
  TrendingUp,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Investment, InvestmentPriority, InvestmentStatus } from '../../types';
import { formatBRL, formatDateBR } from '../../utils/finance';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const InvestmentsScreen: React.FC = () => {
  const {
    investments,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    markInvestmentAcquired,
    addToast,
    setActiveScreen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'Todas' | InvestmentPriority>('Todas');
  const [statusFilter, setStatusFilter] = useState<'Todas' | InvestmentStatus>('Todas');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState<Investment | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Investment | null>(null);

  // Acquisition Modal State
  const [acquireModalTarget, setAcquireModalTarget] = useState<Investment | null>(null);
  const [acquireData, setAcquireData] = useState({
    actualCost: 1500.0,
    actualDate: new Date().toISOString().split('T')[0],
    registerInAssets: true,
  });

  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    justification: '',
    quantity: 1,
    estimatedUnitValue: 1500.0,
    priority: 'Alta' as InvestmentPriority,
    registrationDate: new Date().toISOString().split('T')[0],
    plannedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    supplierOrQuoteRef: '',
    responsible: 'Erik Coronado',
    status: 'Planejado' as InvestmentStatus,
    notes: '',
  });

  const openNewModal = () => {
    setEditingInvestment(null);
    setFormData({
      itemName: 'Kit de demonstração NR-11',
      description:
        'Aquisição de acessórios para atividades práticas de treinamento sobre estabilidade, centro de carga e segurança na operação de empilhadeiras.',
      justification:
        'Aprimorar o aprendizado prático dos operadores e cumprir novas recomendações de instrução visual.',
      quantity: 1,
      estimatedUnitValue: 1500.0,
      priority: 'Alta',
      registrationDate: new Date().toISOString().split('T')[0],
      plannedDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplierOrQuoteRef: 'Sinaliza Brasil / Equipamentos Industriais',
      responsible: 'Erik Coronado',
      status: 'Planejado',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (inv: Investment) => {
    setEditingInvestment(inv);
    setFormData({
      itemName: inv.itemName,
      description: inv.description,
      justification: inv.justification,
      quantity: inv.quantity,
      estimatedUnitValue: inv.estimatedUnitValue,
      priority: inv.priority,
      registrationDate: inv.registrationDate,
      plannedDate: inv.plannedDate,
      supplierOrQuoteRef: inv.supplierOrQuoteRef || '',
      responsible: inv.responsible,
      status: inv.status,
      notes: inv.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.itemName.trim()) {
      addToast('O nome do item ou equipamento é obrigatório.', 'error');
      return;
    }

    if (formData.quantity < 1) {
      addToast('A quantidade deve ser no mínimo 1.', 'error');
      return;
    }

    const payload = {
      itemName: formData.itemName,
      description: formData.description,
      justification: formData.justification,
      quantity: Number(formData.quantity) || 1,
      estimatedUnitValue: Number(formData.estimatedUnitValue) || 0,
      priority: formData.priority,
      registrationDate: formData.registrationDate,
      plannedDate: formData.plannedDate,
      supplierOrQuoteRef: formData.supplierOrQuoteRef,
      responsible: formData.responsible || 'Erik Coronado',
      status: formData.status,
      notes: formData.notes,
    };

    if (editingInvestment) {
      updateInvestment(editingInvestment.id, payload);
    } else {
      addInvestment(payload);
    }

    setModalOpen(false);
  };

  const openAcquireModal = (inv: Investment) => {
    setAcquireModalTarget(inv);
    setAcquireData({
      actualCost: inv.estimatedTotalValue,
      actualDate: new Date().toISOString().split('T')[0],
      registerInAssets: true,
    });
  };

  const confirmAcquisition = () => {
    if (!acquireModalTarget) return;
    markInvestmentAcquired(
      acquireModalTarget.id,
      Number(acquireData.actualCost) || acquireModalTarget.estimatedTotalValue,
      acquireData.actualDate,
      acquireData.registerInAssets
    );
    setAcquireModalTarget(null);
  };

  // KPIs
  const pendingItems = investments.filter((i) => i.status !== 'Adquirido');
  const acquiredItems = investments.filter((i) => i.status === 'Adquirido');
  const highPriorityPending = pendingItems.filter((i) => i.priority === 'Alta');
  const totalPendingCost = pendingItems.reduce((sum, i) => sum + i.estimatedTotalValue, 0);

  const filtered = investments.filter((i) => {
    const matchesSearch =
      i.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      i.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.supplierOrQuoteRef && i.supplierOrQuoteRef.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesPriority = priorityFilter === 'Todas' || i.priority === priorityFilter;
    const matchesStatus = statusFilter === 'Todas' || i.status === statusFilter;

    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* 4 Investment Indicator Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Itens Planejados
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#D5A34C] tabular-nums">
            {pendingItems.length}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">Aquisições futuras em análise</div>
        </div>

        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Investimento Estimado
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#153246] dark:text-[#EDF3F5] tabular-nums">
            {formatBRL(totalPendingCost)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">Custo previsto das compras pendentes</div>
        </div>

        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Alta Prioridade
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#B94949] tabular-nums">
            {highPriorityPending.length}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">Essenciais para novos treinamentos</div>
        </div>

        <div className="bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
          <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-1">
            Itens Adquiridos
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#16836F] tabular-nums">
            {acquiredItems.length}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">Já integrados à rotina operacional</div>
        </div>
      </div>

      {/* Info notice explaining financial rule */}
      <div className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between gap-3 text-xs text-[#20313C] dark:text-[#EDF3F5]">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#D5A34C] shrink-0" />
          <span>
            <strong>Diretriz Financeira:</strong> Investimentos planejados são necessidades e metas futuras da empresa. Eles <strong>não</strong> são debitados do lucro mensal até que a compra seja efetivada e paga.
          </span>
        </div>
        <button
          onClick={() => setActiveScreen('patrimonio')}
          className="text-xs font-semibold text-[#16836F] hover:underline whitespace-nowrap"
        >
          Ver Patrimônio
        </button>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar item, descrição ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] placeholder-[#71818B] focus:border-[#16836F] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as any)}
              className="text-xs p-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5]"
            >
              <option value="Todas">Todas as prioridades</option>
              <option value="Alta">Alta prioridade</option>
              <option value="Média">Média prioridade</option>
              <option value="Baixa">Baixa prioridade</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="text-xs p-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5]"
            >
              <option value="Todas">Todos os status</option>
              <option value="Planejado">Planejado</option>
              <option value="Em cotação">Em cotação</option>
              <option value="Aprovado">Aprovado</option>
              <option value="Adquirido">Adquirido</option>
            </select>
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Planejar investimento</span>
        </button>
      </div>

      {/* Investments Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <TrendingUp className="w-10 h-10 text-[#71818B]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Nenhum investimento registrado
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 mb-4">
              Planeje aquisições de novos equipamentos para expandir o portfólio de treinamentos.
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#16836F] text-white text-xs font-bold rounded-xl"
            >
              Planejar primeira aquisição
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Item / Equipamento</th>
                  <th className="py-3 px-4">Necessidade & Justificativa</th>
                  <th className="py-3 px-4 text-center">Qtd</th>
                  <th className="py-3 px-4 text-right">Valor Previsto</th>
                  <th className="py-3 px-4">Prioridade</th>
                  <th className="py-3 px-4">Previsão</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((inv) => {
                  const isHigh = inv.priority === 'Alta';
                  const isAcquired = inv.status === 'Adquirido';

                  return (
                    <tr
                      key={inv.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#20313C] dark:text-[#EDF3F5]">
                        <div>{inv.itemName}</div>
                        {inv.supplierOrQuoteRef && (
                          <div className="text-[10px] text-[#71818B] font-normal">
                            Ref: {inv.supplierOrQuoteRef}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] max-w-sm">
                        <div className="line-clamp-2">{inv.description}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
                        {inv.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#D5A34C] tabular-nums whitespace-nowrap">
                        {formatBRL(inv.estimatedTotalValue)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isHigh ? 'text-[#B94949]' : 'text-[#71818B]'
                          }`}
                        >
                          {inv.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        {formatDateBR(inv.plannedDate)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isAcquired ? 'text-[#16836F]' : 'text-[#D5A34C]'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isAcquired && (
                            <button
                              onClick={() => openAcquireModal(inv)}
                              className="px-2 py-1 bg-[#E4F4EF] hover:bg-[#16836F] text-[#16836F] hover:text-white rounded-lg text-[11px] font-bold transition-colors"
                              title="Marcar como adquirido e integrar ao patrimônio"
                            >
                              Adquirir
                            </button>
                          )}
                          <button
                            onClick={() => openEditModal(inv)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar investimento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(inv)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir investimento"
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

      {/* Modal: Form Investimento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[#D5A34C] flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  {editingInvestment ? 'Editar Planejamento' : 'Planejar Novo Investimento'}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Nome do Item ou Equipamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.itemName}
                    onChange={(e) => setFormData({ ...formData, itemName: e.target.value })}
                    placeholder="Ex: Kit de demonstração NR-11"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Descrição Completa da Necessidade
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva exatamente o que precisa ser comprado e onde será aplicado."
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Justificativa Comercial e Técnica
                  </label>
                  <textarea
                    rows={2}
                    value={formData.justification}
                    onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
                    placeholder="Por que este investimento é estratégico? Retorno esperado em treinamentos."
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Quantidade Desejada *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Valor Unitário Estimado (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={formData.estimatedUnitValue}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        estimatedUnitValue: Number(e.target.value),
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#D5A34C] font-bold text-sm tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Valor Total Previsto
                  </label>
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-[#D5A34C] font-extrabold text-sm tabular-nums">
                    {formatBRL(formData.quantity * formData.estimatedUnitValue)}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Prioridade *
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        priority: e.target.value as InvestmentPriority,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Alta">Alta</option>
                    <option value="Média">Média</option>
                    <option value="Baixa">Baixa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Status Atual *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as InvestmentStatus,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Planejado">Planejado</option>
                    <option value="Em cotação">Em cotação</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Adquirido">Adquirido</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data Planejada para Compra
                  </label>
                  <input
                    type="date"
                    value={formData.plannedDate}
                    onChange={(e) => setFormData({ ...formData, plannedDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Fornecedor / Orçamento de Referência
                  </label>
                  <input
                    type="text"
                    value={formData.supplierOrQuoteRef}
                    onChange={(e) =>
                      setFormData({ ...formData, supplierOrQuoteRef: e.target.value })
                    }
                    placeholder="Empresa fornecedora ou link"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.responsible}
                    onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                    placeholder="Erik Coronado"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>
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
                  {editingInvestment ? 'Salvar Alterações' : 'Registrar Investimento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Adquirir Investimento */}
      {acquireModalTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center shrink-0">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  Efetivar Aquisição
                </h3>
                <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-0.5">
                  Confirmar compra de "{acquireModalTarget.itemName}"
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs mb-5">
              <div>
                <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                  Valor Efetivamente Pago (R$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={acquireData.actualCost}
                  onChange={(e) =>
                    setAcquireData({ ...acquireData, actualCost: Number(e.target.value) })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#16836F] font-bold text-sm tabular-nums"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                  Data da Compra Efetiva
                </label>
                <input
                  type="date"
                  required
                  value={acquireData.actualDate}
                  onChange={(e) => setAcquireData({ ...acquireData, actualDate: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5]"
                />
              </div>

              <div className="p-3 rounded-xl bg-[#E4F4EF] dark:bg-[#16836F]/10 border border-[#16836F]/30 flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="regAsset"
                  checked={acquireData.registerInAssets}
                  onChange={(e) =>
                    setAcquireData({ ...acquireData, registerInAssets: e.target.checked })
                  }
                  className="rounded text-[#16836F] w-4 h-4"
                />
                <label
                  htmlFor="regAsset"
                  className="text-xs font-semibold text-[#153246] dark:text-[#EDF3F5] cursor-pointer"
                >
                  Incorporar automaticamente ao módulo de Patrimônio e Bens
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setAcquireModalTarget(null)}
                className="px-4 py-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-[#71818B] font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmAcquisition}
                className="px-5 py-2 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white font-bold"
              >
                Confirmar Aquisição
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Investimento Planejado"
        message={`Tem certeza que deseja excluir o planejamento de "${deleteTarget?.itemName}"?`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteInvestment(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
