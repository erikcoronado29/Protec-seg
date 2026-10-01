import {
  AlertCircle,
  Calendar,
  DollarSign,
  Download,
  Edit2,
  FileSpreadsheet,
  GraduationCap,
  Info,
  MapPin,
  Plus,
  Search,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Training, TrainingStatus } from '../../types';
import {
  calculateTrainingCosts,
  formatBRL,
  formatDateBR,
} from '../../utils/finance';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const TrainingsScreen: React.FC = () => {
  const {
    trainings,
    companies,
    settings,
    addTraining,
    updateTraining,
    deleteTraining,
    modalNewTrainingOpen,
    setModalNewTrainingOpen,
    trainingPrefill,
    setTrainingPrefill,
    addToast,
    setActiveScreen,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | TrainingStatus>('Todas');

  // Edit / Form state
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Training | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    companyId: '',
    title: '',
    nrNumber: '',
    date: new Date().toISOString().split('T')[0],
    participants: 10,
    status: 'Realizado' as TrainingStatus,
    revenue: 1000.0,
    distanceKm: 80,
    ratePerKmSnapshot: settings.ratePerKm,
    manHours: 8,
    ratePerHourSnapshot: settings.ratePerHour,
    otherCosts: 100.0,
    otherCostsDescription: 'Material didático e certificados',
    instructor: 'Erik Coronado',
    notes: '',
  });

  // Open modal when modalNewTrainingOpen is triggered externally
  useEffect(() => {
    if (modalNewTrainingOpen) {
      if (trainingPrefill) {
        setEditingTraining(null);
        const count = trainings.length + 1;
        const year = new Date().getFullYear();
        const code = `TRN-${year}-${String(count).padStart(3, '0')}`;

        setFormData({
          code,
          companyId: trainingPrefill.companyId || companies[0]?.id || '',
          title: trainingPrefill.title || 'Treinamento Normativo SST',
          nrNumber: trainingPrefill.nrNumber || 'NR-35',
          date: trainingPrefill.date || new Date().toISOString().split('T')[0],
          participants: trainingPrefill.participants || 10,
          status: trainingPrefill.status || 'Realizado',
          revenue: trainingPrefill.revenue || 1000.0,
          distanceKm: 80,
          ratePerKmSnapshot: settings.ratePerKm,
          manHours: 8,
          ratePerHourSnapshot: settings.ratePerHour,
          otherCosts: 100.0,
          otherCostsDescription: 'Material e apostilas',
          instructor: 'Erik Coronado',
          notes: '',
        });
        setTrainingPrefill(null);
      } else if (!editingTraining) {
        openNewModal();
      }
    }
  }, [modalNewTrainingOpen]);

  const openNewModal = () => {
    setEditingTraining(null);
    const count = trainings.length + 1;
    const year = new Date().getFullYear();
    const code = `TRN-${year}-${String(count).padStart(3, '0')}`;
    const defaultCompany = companies[0]?.id || '';

    setFormData({
      code,
      companyId: defaultCompany,
      title: 'Treinamento NR-35 — Trabalho em Altura',
      nrNumber: 'NR-35',
      date: new Date().toISOString().split('T')[0],
      participants: 10,
      status: 'Realizado',
      revenue: 1000.0,
      distanceKm: 80,
      ratePerKmSnapshot: settings.ratePerKm,
      manHours: 8,
      ratePerHourSnapshot: settings.ratePerHour,
      otherCosts: 100.0,
      otherCostsDescription: 'Material didático e certificados',
      instructor: 'Erik Coronado',
      notes: '',
    });
    setModalNewTrainingOpen(true);
  };

  const openEditModal = (t: Training) => {
    setEditingTraining(t);
    setFormData({
      code: t.code,
      companyId: t.companyId,
      title: t.title,
      nrNumber: t.nrNumber || '',
      date: t.date,
      participants: t.participants,
      status: t.status,
      revenue: t.revenue,
      distanceKm: t.distanceKm,
      ratePerKmSnapshot: t.ratePerKmSnapshot,
      manHours: t.manHours,
      ratePerHourSnapshot: t.ratePerHourSnapshot,
      otherCosts: t.otherCosts,
      otherCostsDescription: t.otherCostsDescription || '',
      instructor: t.instructor,
      notes: t.notes || '',
    });
    setModalNewTrainingOpen(true);
  };

  const closeModal = () => {
    setModalNewTrainingOpen(false);
    setEditingTraining(null);
    setTrainingPrefill(null);
  };

  // Live calculation for preview box inside modal
  const liveCalculation = calculateTrainingCosts(
    formData.distanceKm,
    formData.ratePerKmSnapshot,
    formData.manHours,
    formData.ratePerHourSnapshot,
    formData.otherCosts,
    formData.revenue
  );

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const selectedCompany = companies.find((c) => c.id === formData.companyId);
    if (!selectedCompany) {
      addToast('Selecione a empresa contratante do treinamento.', 'error');
      return;
    }

    if (!formData.title.trim()) {
      addToast('O nome do treinamento é obrigatório.', 'error');
      return;
    }

    const payload = {
      code: formData.code,
      companyId: selectedCompany.id,
      companyName: selectedCompany.name,
      title: formData.title,
      nrNumber: formData.nrNumber,
      date: formData.date,
      participants: Number(formData.participants) || 1,
      status: formData.status,
      revenue: Number(formData.revenue) || 0,
      distanceKm: Number(formData.distanceKm) || 0,
      ratePerKmSnapshot: Number(formData.ratePerKmSnapshot) || settings.ratePerKm,
      manHours: Number(formData.manHours) || 0,
      ratePerHourSnapshot: Number(formData.ratePerHourSnapshot) || settings.ratePerHour,
      otherCosts: Number(formData.otherCosts) || 0,
      otherCostsDescription: formData.otherCostsDescription,
      instructor: formData.instructor || 'Erik Coronado',
      notes: formData.notes,
    };

    if (editingTraining) {
      updateTraining(editingTraining.id, payload);
    } else {
      addTraining(payload);
    }

    closeModal();
  };

  const filtered = trainings.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.nrNumber && t.nrNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'Todas' || t.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por curso, NR, empresa ou código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] placeholder-[#71818B] focus:border-[#16836F] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#202E37] p-1 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs font-semibold overflow-x-auto">
            {(['Todas', 'Realizado', 'Agendado', 'Cancelado'] as const).map((st) => (
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
          <span>Cadastrar treinamento</span>
        </button>
      </div>

      {/* Trainings Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <GraduationCap className="w-10 h-10 text-[#71818B]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Nenhum treinamento localizado
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 mb-4">
              Ajuste seus filtros de busca ou registre um novo treinamento concluído ou agendado.
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#16836F] text-white text-xs font-bold rounded-xl"
            >
              Registrar primeiro treinamento
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Treinamento / NR</th>
                  <th className="py-3 px-4">Empresa</th>
                  <th className="py-3 px-4">Data</th>
                  <th className="py-3 px-4 text-center">Alunos</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Receita</th>
                  <th className="py-3 px-4 text-right">Custo Direto</th>
                  <th className="py-3 px-4 text-right">Resultado Direto</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((t) => {
                  const isDone = t.status === 'Realizado';
                  const isScheduled = t.status === 'Agendado';
                  const isCancelled = t.status === 'Cancelado';

                  return (
                    <tr
                      key={t.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div className="flex items-center gap-2">
                          {t.nrNumber && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F]">
                              {t.nrNumber}
                            </span>
                          )}
                          <span className="font-bold">{t.title}</span>
                        </div>
                        <div className="text-[10px] text-[#71818B] mt-0.5">
                          {t.code} · Instrutor: {t.instructor}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE]">
                        {t.companyName}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        {formatDateBR(t.date)}
                      </td>
                      <td className="py-3.5 px-4 text-center text-[#20313C] dark:text-[#EDF3F5] font-semibold tabular-nums">
                        {t.participants}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
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
                      <td className="py-3.5 px-4 text-right font-bold text-[#20313C] dark:text-[#EDF3F5] tabular-nums whitespace-nowrap">
                        {formatBRL(t.revenue)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-medium text-[#D5A34C] tabular-nums whitespace-nowrap">
                        {formatBRL(t.totalDirectCost)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-extrabold tabular-nums whitespace-nowrap">
                        <span
                          className={
                            t.directResult >= 0 ? 'text-[#16836F]' : 'text-[#B94949]'
                          }
                        >
                          {formatBRL(t.directResult)}
                        </span>
                        {t.revenue > 0 && (
                          <div className="text-[10px] font-semibold text-[#71818B]">
                            {t.marginPercent}% margem
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(t)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar treinamento"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(t)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir treinamento"
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

      {/* Modal: Cadastro / Edição de Treinamento */}
      {modalNewTrainingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
                  <GraduationCap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                    {editingTraining
                      ? `Editar Treinamento ${formData.code}`
                      : 'Registrar Treinamento SST'}
                  </h3>
                  <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
                    Cálculo automatizado de deslocamento, mão de obra e resultado direto
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-1 text-[#71818B] hover:text-[#20313C] dark:hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              {/* Row 1: Identification */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Código do Registro *
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
                    Empresa Contratante *
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
              </div>

              {/* Row 2: Training Title, NR & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                <div className="sm:col-span-6">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Nome do Treinamento / Curso *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Treinamento NR-35 Trabalho em Altura"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Norma (NR)
                  </label>
                  <input
                    type="text"
                    value={formData.nrNumber}
                    onChange={(e) => setFormData({ ...formData, nrNumber: e.target.value })}
                    placeholder="NR-35"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as TrainingStatus })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-semibold outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Realizado">Realizado</option>
                    <option value="Agendado">Agendado</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Revenue & Participants & Instructor */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Valor Cobrado do Cliente (Receita R$) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min={0}
                    required
                    value={formData.revenue}
                    onChange={(e) => setFormData({ ...formData, revenue: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#16836F] font-extrabold text-sm tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Qtd. de Participantes *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={formData.participants}
                    onChange={(e) =>
                      setFormData({ ...formData, participants: Number(e.target.value) })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Instrutor Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.instructor}
                    onChange={(e) => setFormData({ ...formData, instructor: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>
              </div>

              {/* Direct Costs Section */}
              <div className="p-4 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#20313C] dark:text-[#EDF3F5]">
                    Custos Diretos do Treinamento
                  </span>
                  <span className="text-[10px] text-[#71818B]">
                    Tarifas históricas gravadas neste registro
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Deslocamento */}
                  <div className="p-3 bg-white dark:bg-[#1B272F] rounded-xl border border-[#E2E9EC] dark:border-[#34434C]">
                    <div className="font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-2 flex items-center justify-between">
                      <span>Deslocamento</span>
                      <span className="text-xs font-bold text-[#D5A34C] tabular-nums">
                        {formatBRL(liveCalculation.travelCost)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          KM Total Percorrido
                        </label>
                        <input
                          type="number"
                          min={0}
                          value={formData.distanceKm}
                          onChange={(e) =>
                            setFormData({ ...formData, distanceKm: Number(e.target.value) })
                          }
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Tarifa / KM (R$)
                        </label>
                        <input
                          type="number"
                          step="0.05"
                          min={0}
                          value={formData.ratePerKmSnapshot}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ratePerKmSnapshot: Number(e.target.value),
                            })
                          }
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Mão de Obra */}
                  <div className="p-3 bg-white dark:bg-[#1B272F] rounded-xl border border-[#E2E9EC] dark:border-[#34434C]">
                    <div className="font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-2 flex items-center justify-between">
                      <span>Mão de Obra (Horas-Homem)</span>
                      <span className="text-xs font-bold text-[#D5A34C] tabular-nums">
                        {formatBRL(liveCalculation.laborCost)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Horas Trabalhadas
                        </label>
                        <input
                          type="number"
                          step="0.5"
                          min={0}
                          value={formData.manHours}
                          onChange={(e) =>
                            setFormData({ ...formData, manHours: Number(e.target.value) })
                          }
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-[#71818B] mb-0.5">
                          Custo / Hora (R$)
                        </label>
                        <input
                          type="number"
                          step="1.00"
                          min={0}
                          value={formData.ratePerHourSnapshot}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ratePerHourSnapshot: Number(e.target.value),
                            })
                          }
                          className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Outros custos diretos */}
                <div className="p-3 bg-white dark:bg-[#1B272F] rounded-xl border border-[#E2E9EC] dark:border-[#34434C]">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] text-[#71818B] mb-0.5">
                        Outros Custos Diretos (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min={0}
                        value={formData.otherCosts}
                        onChange={(e) =>
                          setFormData({ ...formData, otherCosts: Number(e.target.value) })
                        }
                        className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] tabular-nums"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-[#71818B] mb-0.5">
                        Descrição dos Outros Custos
                      </label>
                      <input
                        type="text"
                        value={formData.otherCostsDescription}
                        onChange={(e) =>
                          setFormData({ ...formData, otherCostsDescription: e.target.value })
                        }
                        placeholder="Ex: Certificados impressos, crachás, alimentação, pedágios"
                        className="w-full p-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Calculation Preview Box */}
              <div className="p-4 rounded-xl bg-[#153246] text-white space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#1C4357] pb-2">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#A8B6BE]">
                    Quadro de Cálculo em Tempo Real
                  </span>
                  <span className="text-[10px] text-[#E4F4EF]">
                    Margem: <strong>{liveCalculation.marginPercent}%</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                  <div>
                    <div className="text-[#A8B6BE]">Receita Informada</div>
                    <div className="font-bold text-[#E4F4EF] tabular-nums">
                      {formatBRL(formData.revenue)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A8B6BE]">Deslocamento</div>
                    <div className="font-bold text-[#D5A34C] tabular-nums">
                      {formatBRL(liveCalculation.travelCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A8B6BE]">Mão de Obra</div>
                    <div className="font-bold text-[#D5A34C] tabular-nums">
                      {formatBRL(liveCalculation.laborCost)}
                    </div>
                  </div>
                  <div>
                    <div className="text-[#A8B6BE]">Outros Custos</div>
                    <div className="font-bold text-[#D5A34C] tabular-nums">
                      {formatBRL(formData.otherCosts)}
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#1C4357] flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[#A8B6BE]">Custo Direto Total: </span>
                    <strong className="text-[#D5A34C] tabular-nums">
                      {formatBRL(liveCalculation.totalDirectCost)}
                    </strong>
                  </div>
                  <div>
                    <span className="text-[#A8B6BE]">Resultado Direto Estimado: </span>
                    <strong
                      className={`text-sm font-extrabold tabular-nums ${
                        liveCalculation.directResult >= 0 ? 'text-[#38D39F]' : 'text-[#FF7675]'
                      }`}
                    >
                      {formatBRL(liveCalculation.directResult)}
                    </strong>
                  </div>
                </div>

                <div className="text-[10px] text-[#A8B6BE] pt-1 border-t border-[#1C4357]/60">
                  <em>
                    * Nota: Este valor representa o resultado direto operacional do treinamento.
                    O lucro líquido final da empresa será apurado após descontar as despesas operacionais mensais no módulo Financeiro.
                  </em>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                  Observações Gerais
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Observações técnicas, lista de presença, ocorrências no treinamento."
                  className="w-full p-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                />
              </div>

              <div className="pt-3 border-t border-[#E2E9EC] dark:border-[#34434C] flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-[#71818B] hover:text-[#20313C] font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white font-bold transition-colors"
                >
                  {editingTraining ? 'Salvar Alterações' : 'Registrar Treinamento'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Treinamento"
        message={`Tem certeza que deseja excluir o treinamento "${deleteTarget?.title}" (${deleteTarget?.code})? Os custos diretos e receitas serão removidos do histórico.`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteTraining(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
