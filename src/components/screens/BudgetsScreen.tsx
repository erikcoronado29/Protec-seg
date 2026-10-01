import {
  CheckCircle2,
  Copy,
  DollarSign,
  Edit2,
  FileCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  Plus,
  Printer,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Budget, BudgetItem, BudgetStatus } from '../../types';
import { formatBRL, formatDateBR } from '../../utils/finance';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const BudgetsScreen: React.FC = () => {
  const {
    budgets,
    companies,
    addBudget,
    updateBudget,
    deleteBudget,
    duplicateBudget,
    setSelectedBudgetForPrint,
    setModalNewTrainingOpen,
    setTrainingPrefill,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | BudgetStatus>('Todas');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    companyId: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    expectedDate: '',
    serviceName: '',
    description: '',
    paymentTerms: 'Faturamento 28 dias após conclusão e emissão dos certificados.',
    commercialNotes: 'Incluso material didático digital, certificado com ART e registro.',
    status: 'Rascunho' as BudgetStatus,
    items: [
      {
        id: 'item-1',
        serviceName: 'Treinamento NR-35 — Trabalho em Altura (8h)',
        nrCode: 'NR-35',
        participants: 10,
        unitPrice: 150.0,
        totalPrice: 1500.0,
      },
    ] as BudgetItem[],
  });

  const openNewModal = () => {
    setEditingBudget(null);
    const count = budgets.length + 1;
    const year = new Date().getFullYear();
    const generatedCode = `ORC-${year}-${String(count).padStart(3, '0')}`;
    const defaultCompany = companies[0]?.id || '';

    setFormData({
      code: generatedCode,
      companyId: defaultCompany,
      issueDate: new Date().toISOString().split('T')[0],
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      expectedDate: '',
      serviceName: 'Capacitação Normativa em SST',
      description: 'Prestação de serviços de instrução teórica e prática com certificação.',
      paymentTerms: 'Faturamento 28 dias após conclusão e emissão dos certificados.',
      commercialNotes: 'Incluso material didático digital, certificado com ART e registro.',
      status: 'Rascunho',
      items: [
        {
          id: `item-${Date.now()}`,
          serviceName: 'Treinamento NR-35 — Trabalho em Altura',
          nrCode: 'NR-35',
          participants: 10,
          unitPrice: 150.0,
          totalPrice: 1500.0,
        },
      ],
    });
    setModalOpen(true);
  };

  const openEditModal = (b: Budget) => {
    setEditingBudget(b);
    setFormData({
      code: b.code,
      companyId: b.companyId,
      issueDate: b.issueDate,
      validUntil: b.validUntil,
      expectedDate: b.expectedDate || '',
      serviceName: b.serviceName,
      description: b.description,
      paymentTerms: b.paymentTerms,
      commercialNotes: b.commercialNotes || '',
      status: b.status,
      items: b.items.length > 0 ? b.items : [
        {
          id: `item-${Date.now()}`,
          serviceName: b.serviceName,
          participants: b.participantsTotal,
          unitPrice: b.participantsTotal > 0 ? b.totalValue / b.participantsTotal : b.totalValue,
          totalPrice: b.totalValue,
        },
      ],
    });
    setModalOpen(true);
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, val: any) => {
    const updated = [...formData.items];
    const item = { ...updated[index], [field]: val };

    if (field === 'participants' || field === 'unitPrice') {
      const parts = field === 'participants' ? Number(val) : item.participants;
      const unitP = field === 'unitPrice' ? Number(val) : item.unitPrice;
      item.totalPrice = Number((parts * unitP).toFixed(2));
    }

    updated[index] = item;
    setFormData({ ...formData, items: updated });
  };

  const addItemRow = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          id: `item-${Date.now()}`,
          serviceName: '',
          participants: 1,
          unitPrice: 0,
          totalPrice: 0,
        },
      ],
    });
  };

  const removeItemRow = (index: number) => {
    if (formData.items.length <= 1) {
      addToast('O orçamento deve possuir pelo menos um serviço.', 'error');
      return;
    }
    const updated = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updated });
  };

  // Recalculate total
  const calculatedTotalValue = formData.items.reduce(
    (sum, it) => sum + (Number(it.totalPrice) || 0),
    0
  );
  const calculatedTotalParticipants = formData.items.reduce(
    (sum, it) => sum + (Number(it.participants) || 0),
    0
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCompany = companies.find((c) => c.id === formData.companyId);
    if (!selectedCompany) {
      addToast('Selecione uma empresa cadastrada para vincular o orçamento.', 'error');
      return;
    }

    if (formData.items.some((it) => !it.serviceName.trim())) {
      addToast('Informe o nome de todos os serviços listados no orçamento.', 'error');
      return;
    }

    const payload = {
      code: formData.code,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      issueDate: formData.issueDate,
      validUntil: formData.validUntil,
      expectedDate: formData.expectedDate,
      serviceName: formData.serviceName || formData.items[0]?.serviceName || 'Treinamentos SST',
      description: formData.description,
      items: formData.items,
      participantsTotal: calculatedTotalParticipants,
      totalValue: calculatedTotalValue,
      paymentTerms: formData.paymentTerms,
      commercialNotes: formData.commercialNotes,
      status: formData.status,
    };

    if (editingBudget) {
      updateBudget(editingBudget.id, payload);
    } else {
      addBudget(payload);
    }

    setModalOpen(false);
  };

  // Quick Action: Convert approved proposal to training
  const handleConvertToTraining = (b: Budget) => {
    setTrainingPrefill({
      companyId: b.companyId,
      companyName: b.companyName,
      title: b.items[0]?.serviceName || b.serviceName,
      nrNumber: b.items[0]?.nrCode,
      participants: b.participantsTotal,
      revenue: b.totalValue,
      date: b.expectedDate || new Date().toISOString().split('T')[0],
      status: 'Realizado',
    });
    setModalNewTrainingOpen(true);
    addToast(
      `Dados do orçamento ${b.code} importados para o formulário de treinamento.`,
      'info'
    );
  };

  const filtered = budgets.filter((b) => {
    const matchesSearch =
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.serviceName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todas' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por código, empresa ou serviço..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] placeholder-[#71818B] focus:border-[#16836F] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#202E37] p-1 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs font-semibold overflow-x-auto">
            {(['Todas', 'Rascunho', 'Enviado', 'Aprovado', 'Rejeitado'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  statusFilter === st
                    ? 'bg-white dark:bg-[#1B272F] text-[#16836F] shadow-xs font-bold'
                    : 'text-[#71818B] dark:text-[#A8B6BE] hover:text-[#20313C]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Criar orçamento</span>
        </button>
      </div>

      {/* Budgets List / Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <FileSpreadsheet className="w-10 h-10 text-[#71818B]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Nenhum orçamento encontrado
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 mb-4">
              Crie uma nova proposta comercial para seus clientes.
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#16836F] text-white text-xs font-bold rounded-xl"
            >
              Criar primeira proposta
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Proposta</th>
                  <th className="py-3 px-4">Empresa Contratante</th>
                  <th className="py-3 px-4">Serviços Inclusos</th>
                  <th className="py-3 px-4">Emissão / Validade</th>
                  <th className="py-3 px-4 text-center">Alunos</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((b) => {
                  const isApproved = b.status === 'Aprovado';
                  const isSent = b.status === 'Enviado';
                  const isDraft = b.status === 'Rascunho';

                  return (
                    <tr
                      key={b.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-bold text-[#153246] dark:text-[#38D39F] tabular-nums whitespace-nowrap">
                        {b.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div>{b.companyName}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] max-w-xs">
                        <div className="truncate font-medium text-[#20313C] dark:text-[#EDF3F5]">
                          {b.serviceName}
                        </div>
                        {b.items.length > 1 && (
                          <div className="text-[10px] text-[#16836F]">
                            +{b.items.length - 1} serviço(s) adicional(is)
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        <div>{formatDateBR(b.issueDate)}</div>
                        <div className="text-[10px] text-[#71818B]">
                          Até {formatDateBR(b.validUntil)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#20313C] dark:text-[#EDF3F5] font-semibold tabular-nums">
                        {b.participantsTotal}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#16836F] tabular-nums whitespace-nowrap">
                        {formatBRL(b.totalValue)}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isApproved
                              ? 'text-[#16836F]'
                              : isSent
                              ? 'text-[#1C4357] dark:text-[#A8B6BE]'
                              : isDraft
                              ? 'text-[#D5A34C]'
                              : 'text-[#B94949]'
                          }`}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* If approved, quick convert to Training */}
                          {isApproved && (
                            <button
                              onClick={() => handleConvertToTraining(b)}
                              className="p-1.5 text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                              title="Registrar Treinamento a partir deste orçamento"
                            >
                              <GraduationCap className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Print / PDF document preview */}
                          <button
                            onClick={() => setSelectedBudgetForPrint(b)}
                            className="p-1.5 text-[#71818B] hover:text-[#153246] dark:hover:text-[#EDF3F5] hover:bg-[#F4F7F8] dark:hover:bg-[#202E37] rounded-lg transition-colors"
                            title="Visualizar / Imprimir PDF da proposta"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => duplicateBudget(b.id)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Duplicar proposta"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(b)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar proposta"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTarget(b)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir proposta"
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

      {/* Modal: Criar / Editar Orçamento */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                    {editingBudget ? `Editar Orçamento ${formData.code}` : 'Novo Orçamento Comercial'}
                  </h3>
                  <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
                    Cálculo automático de itens, participantes e valores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 text-[#71818B] hover:text-[#20313C] dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Número da Proposta *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-bold tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Empresa Contratante (Cliente) *
                  </label>
                  <select
                    required
                    value={formData.companyId}
                    onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-medium outline-hidden focus:border-[#16836F]"
                  >
                    <option value="" disabled>
                      Selecione uma empresa...
                    </option>
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.city}/{c.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data de Emissão *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.issueDate}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data de Validade *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Status da Proposta *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as BudgetStatus })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-semibold outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Rascunho">Rascunho</option>
                    <option value="Enviado">Enviado</option>
                    <option value="Aprovado">Aprovado</option>
                    <option value="Rejeitado">Rejeitado</option>
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Título Geral da Proposta
                  </label>
                  <input
                    type="text"
                    value={formData.serviceName}
                    onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                    placeholder="Ex: Treinamento NR-35 Trabalho em Altura e NR-10 Eletricidade"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>
              </div>

              {/* Multiple Service Lines Box */}
              <div className="p-4 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37]">
                <div className="flex items-center justify-between mb-3">
                  <div className="font-bold text-[#20313C] dark:text-[#EDF3F5]">
                    Linhas de Serviços e Cursos
                  </div>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs font-semibold text-[#16836F] hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Serviço
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.items.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white dark:bg-[#1B272F] rounded-xl border border-[#E2E9EC] dark:border-[#34434C] grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                    >
                      <div className="sm:col-span-5">
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Nome do Treinamento / Serviço *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.serviceName}
                          onChange={(e) => handleItemChange(idx, 'serviceName', e.target.value)}
                          placeholder="Ex: NR-35 Trabalho em Altura (8h)"
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Norma (opcional)
                        </label>
                        <input
                          type="text"
                          value={item.nrCode || ''}
                          onChange={(e) => handleItemChange(idx, 'nrCode', e.target.value)}
                          placeholder="NR-35"
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Qtd. Alunos
                        </label>
                        <input
                          type="number"
                          min={1}
                          value={item.participants}
                          onChange={(e) => handleItemChange(idx, 'participants', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Valor Unitário (R$)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min={0}
                          value={item.unitPrice}
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                        />
                      </div>

                      <div className="sm:col-span-1 flex items-center justify-end gap-1 pt-3 sm:pt-0">
                        <span className="text-[10px] font-bold text-[#16836F] tabular-nums sm:hidden">
                          Total: {formatBRL(item.totalPrice)}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded"
                          title="Remover linha"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Subtotal preview */}
                <div className="mt-3 pt-3 border-t border-[#E2E9EC] dark:border-[#34434C] flex justify-between items-center text-xs">
                  <span className="text-[#71818B]">
                    Total de participantes previstos: <strong>{calculatedTotalParticipants}</strong>
                  </span>
                  <div className="text-right">
                    <span className="text-[#71818B] mr-2">Valor Total da Proposta:</span>
                    <span className="text-base font-extrabold text-[#16836F] tabular-nums">
                      {formatBRL(calculatedTotalValue)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Condições de Pagamento
                  </label>
                  <input
                    type="text"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                    placeholder="Ex: Faturamento 28 dias após emissão da NF"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data Prevista de Realização
                  </label>
                  <input
                    type="date"
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Descrição Detalhada do Escopo
                  </label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Metodologia teórica e prática, equipamentos inclusos, fornecimento de certificados e registro profissional."
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Observações Comerciais & Requisitos
                  </label>
                  <textarea
                    rows={2}
                    value={formData.commercialNotes}
                    onChange={(e) => setFormData({ ...formData, commercialNotes: e.target.value })}
                    placeholder="Instalações necessárias da contratante, EPIs dos alunos, etc."
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
                  {editingBudget ? 'Salvar Proposta' : 'Emitir Orçamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Orçamento"
        message={`Tem certeza que deseja excluir o orçamento ${deleteTarget?.code} da empresa "${deleteTarget?.companyName}"?`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteBudget(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
