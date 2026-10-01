import {
  Archive,
  Boxes,
  CheckCircle2,
  DollarSign,
  Edit2,
  FileText,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
  Wrench,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Asset,
  AssetCategory,
  AssetClassification,
  AssetConservation,
  AssetSituation,
} from '../../types';
import { formatBRL, formatDateBR } from '../../utils/finance';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const AssetsScreen: React.FC = () => {
  const { assets, addAsset, updateAsset, deleteAsset, addToast, setActiveScreen } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [classificationFilter, setClassificationFilter] = useState<'Todas' | AssetClassification>(
    'Todas'
  );

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);

  const categories: AssetCategory[] = [
    'Equipamentos de treinamento',
    'Informática',
    'Veículos',
    'Ferramentas',
    'Mobiliário',
    'Equipamentos audiovisuais',
    'Material didático',
    'Obrigações financeiras',
    'Outros',
  ];

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    category: 'Equipamentos de treinamento' as AssetCategory,
    classification: 'Ativo' as AssetClassification,
    quantity: 2,
    unitValue: 500.0,
    acquisitionDate: new Date().toISOString().split('T')[0],
    supplier: '',
    invoiceNumber: '',
    location: 'Sede Operacional — Armário Técnico',
    responsible: 'Erik Coronado',
    conservationState: 'Bom' as AssetConservation,
    situation: 'Em uso' as AssetSituation,
    notes: '',
  });

  const openNewModal = () => {
    setEditingAsset(null);
    const count = assets.length + 1;
    const code = `PAT-${String(count).padStart(3, '0')}`;

    setFormData({
      code,
      name: 'Kit de Resgate e Trabalho em Altura NR-35',
      category: 'Equipamentos de treinamento',
      classification: 'Ativo',
      quantity: 2,
      unitValue: 500.0,
      acquisitionDate: new Date().toISOString().split('T')[0],
      supplier: 'UltraSafe Equipamentos',
      invoiceNumber: '',
      location: 'Sede Operacional — Armário Técnico',
      responsible: 'Erik Coronado',
      conservationState: 'Bom',
      situation: 'Em uso',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (a: Asset) => {
    setEditingAsset(a);
    setFormData({
      code: a.code,
      name: a.name,
      category: a.category,
      classification: a.classification,
      quantity: a.quantity,
      unitValue: a.unitValue,
      acquisitionDate: a.acquisitionDate,
      supplier: a.supplier || '',
      invoiceNumber: a.invoiceNumber || '',
      location: a.location,
      responsible: a.responsible,
      conservationState: a.conservationState,
      situation: a.situation,
      notes: a.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('O nome do bem ou equipamento é obrigatório.', 'error');
      return;
    }

    if (formData.quantity < 1) {
      addToast('A quantidade deve ser de no mínimo 1 item.', 'error');
      return;
    }

    const payload = {
      code: formData.code,
      name: formData.name,
      category: formData.category,
      classification: formData.classification,
      quantity: Number(formData.quantity) || 1,
      unitValue: Number(formData.unitValue) || 0,
      acquisitionDate: formData.acquisitionDate,
      supplier: formData.supplier,
      invoiceNumber: formData.invoiceNumber,
      location: formData.location || 'Sede Operacional',
      responsible: formData.responsible || 'Erik Coronado',
      conservationState: formData.conservationState,
      situation: formData.situation,
      notes: formData.notes,
    };

    if (editingAsset) {
      updateAsset(editingAsset.id, payload);
    } else {
      addAsset(payload);
    }

    setModalOpen(false);
  };

  // Indicators
  const ativosList = assets.filter((a) => a.classification === 'Ativo');
  const passivosList = assets.filter((a) => a.classification === 'Passivo');
  const imobilizadosList = assets.filter((a) => a.classification === 'Imobilizado');

  const totalAtivos = ativosList.reduce((sum, a) => sum + a.totalValue, 0);
  const totalPassivos = passivosList.reduce((sum, a) => sum + a.totalValue, 0);
  const totalImobilizados = imobilizadosList.reduce((sum, a) => sum + a.totalValue, 0);

  const filtered = assets.filter((a) => {
    const matchesSearch =
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      classificationFilter === 'Todas' || a.classification === classificationFilter;

    return matchesSearch && matchesClass;
  });

  return (
    <div className="space-y-5">
      {/* 3 Classification Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ativos */}
        <div
          onClick={() => setClassificationFilter('Ativo')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            classificationFilter === 'Ativo'
              ? 'bg-white dark:bg-[#1B272F] border-[#16836F] ring-2 ring-[#16836F]/20'
              : 'bg-white dark:bg-[#1B272F] border-[#E2E9EC] dark:border-[#34434C] hover:border-[#16836F]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase">
              Bens & Ativos ({ativosList.length})
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-[#E4F4EF] text-[#16836F] font-bold">
              Ativo
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#16836F] tabular-nums">
            {formatBRL(totalAtivos)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Equipamentos de treinamento e materiais em operação
          </div>
        </div>

        {/* Imobilizados */}
        <div
          onClick={() => setClassificationFilter('Imobilizado')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            classificationFilter === 'Imobilizado'
              ? 'bg-white dark:bg-[#1B272F] border-[#D5A34C] ring-2 ring-[#D5A34C]/20'
              : 'bg-white dark:bg-[#1B272F] border-[#E2E9EC] dark:border-[#34434C] hover:border-[#D5A34C]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase">
              Imobilizado ({imobilizadosList.length})
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-amber-50 text-[#D5A34C] font-bold">
              Imobilizado
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#D5A34C] tabular-nums">
            {formatBRL(totalImobilizados)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Veículos, computadores, mobiliário e eletrônicos
          </div>
        </div>

        {/* Passivos / Obrigações */}
        <div
          onClick={() => setClassificationFilter('Passivo')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            classificationFilter === 'Passivo'
              ? 'bg-white dark:bg-[#1B272F] border-[#B94949] ring-2 ring-[#B94949]/20'
              : 'bg-white dark:bg-[#1B272F] border-[#E2E9EC] dark:border-[#34434C] hover:border-[#B94949]/50'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase">
              Passivos / Obrigações ({passivosList.length})
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-sm bg-red-50 text-[#B94949] font-bold">
              Passivo
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold text-[#B94949] tabular-nums">
            {formatBRL(totalPassivos)}
          </div>
          <div className="text-[10px] text-[#71818B] mt-1">
            Financiamentos patrimoniais e obrigações pendentes
          </div>
        </div>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar bem, código, categoria ou localização..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] placeholder-[#71818B] focus:border-[#16836F] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#202E37] p-1 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs font-semibold overflow-x-auto">
            {(['Todas', 'Ativo', 'Imobilizado', 'Passivo'] as const).map((cl) => (
              <button
                key={cl}
                onClick={() => setClassificationFilter(cl)}
                className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                  classificationFilter === cl
                    ? 'bg-white dark:bg-[#1B272F] text-[#16836F] shadow-xs font-bold'
                    : 'text-[#71818B] dark:text-[#A8B6BE] hover:text-[#20313C]'
                }`}
              >
                {cl}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveScreen('relatorios')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs font-semibold text-[#20313C] dark:text-[#EDF3F5] hover:bg-[#F4F7F8] dark:hover:bg-[#202E37]"
            title="Exportar inventário patrimonial em PDF"
          >
            <FileText className="w-3.5 h-3.5 text-[#16836F]" />
            <span className="hidden sm:inline">Relatório PDF</span>
          </button>
          <button
            onClick={openNewModal}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar bem</span>
          </button>
        </div>
      </div>

      {/* Assets Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Boxes className="w-10 h-10 text-[#71818B]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Nenhum bem patrimonial localizado
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 mb-4">
              Cadastre equipamentos de aula, projetores, EPIs de instrução ou veículos.
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#16836F] text-white text-xs font-bold rounded-xl"
            >
              Cadastrar primeiro bem
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Código / Bem</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4">Classificação</th>
                  <th className="py-3 px-4 text-center">Qtd</th>
                  <th className="py-3 px-4 text-right">Valor Unitário</th>
                  <th className="py-3 px-4 text-right">Valor Total</th>
                  <th className="py-3 px-4">Localização / Resp.</th>
                  <th className="py-3 px-4">Situação</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((a) => {
                  const isAtivo = a.classification === 'Ativo';
                  const isImobilizado = a.classification === 'Imobilizado';

                  return (
                    <tr
                      key={a.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#153246] dark:text-[#38D39F] tabular-nums">
                            {a.code}
                          </span>
                          <span>·</span>
                          <span className="font-bold">{a.name}</span>
                        </div>
                        {a.invoiceNumber && (
                          <div className="text-[10px] text-[#71818B]">
                            {a.invoiceNumber} {a.supplier ? `· ${a.supplier}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] whitespace-nowrap">
                        {a.category}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isAtivo
                              ? 'text-[#16836F]'
                              : isImobilizado
                              ? 'text-[#D5A34C]'
                              : 'text-[#B94949]'
                          }`}
                        >
                          {a.classification}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#20313C] dark:text-[#EDF3F5] tabular-nums">
                        {a.quantity}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        {formatBRL(a.unitValue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold text-[#153246] dark:text-[#EDF3F5] tabular-nums whitespace-nowrap">
                        {formatBRL(a.totalValue)}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#71818B]" />
                          <span>{a.location}</span>
                        </div>
                        <div className="text-[10px] text-[#71818B] flex items-center gap-1 mt-0.5">
                          <User className="w-3 h-3 text-[#71818B]" />
                          <span>{a.responsible}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="text-[11px] font-medium text-[#16836F]">
                          {a.situation} ({a.conservationState})
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(a)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar item patrimonial"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(a)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir item patrimonial"
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

      {/* Modal: Form Patrimônio */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
                  <Boxes className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  {editingAsset ? `Editar Item ${formData.code}` : 'Cadastrar Bem Patrimonial'}
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
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Código Patrimonial *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-bold tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-3">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Nome do Bem ou Equipamento *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Kit de Resgate em Altura NR-35"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Categoria *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as AssetCategory })
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

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Classificação *
                  </label>
                  <select
                    value={formData.classification}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        classification: e.target.value as AssetClassification,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-bold outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Ativo">Ativo (Equipamentos operacionais)</option>
                    <option value="Imobilizado">Imobilizado (Bens fixos e veículos)</option>
                    <option value="Passivo">Passivo (Obrigações patrimoniais)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Quantidade *
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
                    Valor Unitário (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={formData.unitValue}
                    onChange={(e) =>
                      setFormData({ ...formData, unitValue: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Valor Total Calculado (Qtd × Unitário)
                  </label>
                  <div className="p-2.5 rounded-xl bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] font-extrabold text-sm tabular-nums">
                    {formatBRL(formData.quantity * formData.unitValue)}
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data de Aquisição
                  </label>
                  <input
                    type="date"
                    value={formData.acquisitionDate}
                    onChange={(e) => setFormData({ ...formData, acquisitionDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Nota Fiscal (NF)
                  </label>
                  <input
                    type="text"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    placeholder="NF-00000"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Fornecedor
                  </label>
                  <input
                    type="text"
                    value={formData.supplier}
                    onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                    placeholder="Nome da revenda ou fabricante"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Localização Física
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Armário Técnico / Sala de Práticas"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
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

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Estado de Conservação
                  </label>
                  <select
                    value={formData.conservationState}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        conservationState: e.target.value as AssetConservation,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Novo">Novo</option>
                    <option value="Bom">Bom</option>
                    <option value="Regular">Regular</option>
                    <option value="Necessita Manutenção">Necessita Manutenção</option>
                    <option value="Sucata">Sucata</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Situação Operacional
                  </label>
                  <select
                    value={formData.situation}
                    onChange={(e) =>
                      setFormData({ ...formData, situation: e.target.value as AssetSituation })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Em uso">Em uso</option>
                    <option value="Em manutenção">Em manutenção</option>
                    <option value="Em aberto">Em aberto</option>
                    <option value="Quitado">Quitado</option>
                    <option value="Baixado">Baixado</option>
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Observações e Histórico de Manutenção
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Laudos de calibração, inspeções semestrais, número de série."
                    className="w-full p-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
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
                  {editingAsset ? 'Salvar Item' : 'Registrar no Patrimônio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Item Patrimonial"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}" (${deleteTarget?.code})?`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteAsset(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
