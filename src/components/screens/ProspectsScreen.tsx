import {
  Calendar,
  CheckCircle2,
  Clock,
  Compass,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ProspectStatus, ProspectVisit } from '../../types';
import { formatDateBR } from '../../utils/finance';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const ProspectsScreen: React.FC = () => {
  const { prospects, addProspect, updateProspect, deleteProspect, addToast } = useApp();

  const [activeTab, setActiveTab] = useState<'A visitar' | 'Visitada — atendida' | 'Visitada — não atendida' | 'Todas'>('A visitar');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProspect, setEditingProspect] = useState<ProspectVisit | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ProspectVisit | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    cnpj: '',
    contactName: '',
    phoneOrWhatsapp: '',
    email: '',
    city: '',
    state: 'SP',
    address: '',
    scheduledDate: new Date().toISOString().split('T')[0],
    actualDate: '',
    repName: 'Erik Coronado',
    status: 'A visitar' as ProspectStatus,
    notes: '',
    nextAction: '',
    followUpDate: '',
  });

  // Indicator counts
  const countToVisit = prospects.filter((p) => p.status === 'A visitar').length;
  const countAttended = prospects.filter((p) => p.status === 'Visitada — atendida').length;
  const countNotAttended = prospects.filter((p) => p.status === 'Visitada — não atendida').length;

  const openNewModal = () => {
    setEditingProspect(null);
    setFormData({
      companyName: '',
      cnpj: '',
      contactName: '',
      phoneOrWhatsapp: '',
      email: '',
      city: '',
      state: 'SP',
      address: '',
      scheduledDate: new Date().toISOString().split('T')[0],
      actualDate: '',
      repName: 'Erik Coronado',
      status: 'A visitar',
      notes: '',
      nextAction: 'Apresentação institucional de soluções em SST e treinamentos',
      followUpDate: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (p: ProspectVisit) => {
    setEditingProspect(p);
    setFormData({
      companyName: p.companyName,
      cnpj: p.cnpj || '',
      contactName: p.contactName,
      phoneOrWhatsapp: p.phoneOrWhatsapp,
      email: p.email || '',
      city: p.city,
      state: p.state,
      address: p.address || '',
      scheduledDate: p.scheduledDate || '',
      actualDate: p.actualDate || '',
      repName: p.repName,
      status: p.status,
      notes: p.notes || '',
      nextAction: p.nextAction || '',
      followUpDate: p.followUpDate || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.companyName.trim()) {
      addToast('O nome da empresa é obrigatório.', 'error');
      return;
    }
    if (!formData.contactName.trim()) {
      addToast('O contato principal é obrigatório.', 'error');
      return;
    }
    if (!formData.phoneOrWhatsapp.trim()) {
      addToast('O telefone ou WhatsApp é obrigatório.', 'error');
      return;
    }

    if (editingProspect) {
      updateProspect(editingProspect.id, formData);
    } else {
      addProspect(formData);
    }

    setModalOpen(false);
  };

  // Quick status changer
  const handleQuickStatusChange = (prospect: ProspectVisit, newStatus: ProspectStatus) => {
    const isAttended = newStatus === 'Visitada — atendida';
    updateProspect(prospect.id, {
      status: newStatus,
      actualDate: isAttended && !prospect.actualDate ? new Date().toISOString().split('T')[0] : prospect.actualDate,
    });
  };

  const filtered = prospects.filter((p) => {
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.cnpj && p.cnpj.includes(searchTerm));

    const matchesTab = activeTab === 'Todas' || p.status === activeTab;

    return matchesSearch && matchesTab;
  });

  return (
    <div className="space-y-5">
      {/* 3 Status KPI Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Tab 1: A visitar */}
        <div
          onClick={() => setActiveTab('A visitar')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'A visitar'
              ? 'bg-white dark:bg-[#1B272F] border-[#D5A34C] ring-2 ring-[#D5A34C]/20'
              : 'bg-white dark:bg-[#1B272F] border-[#E2E9EC] dark:border-[#34434C] hover:border-[#D5A34C]/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase tracking-wider">
              Empresas a Visitar
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[#D5A34C] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#D5A34C] tabular-nums">
            {countToVisit}
          </div>
          <div className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1">
            Visitas agendadas ou em planejamento
          </div>
        </div>

        {/* Tab 2: Visitada e atendida */}
        <div
          onClick={() => setActiveTab('Visitada — atendida')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'Visitada — atendida'
              ? 'bg-white dark:bg-[#1B272F] border-[#16836F] ring-2 ring-[#16836F]/20'
              : 'bg-white dark:bg-[#1B272F] border-[#E2E9EC] dark:border-[#34434C] hover:border-[#16836F]/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase tracking-wider">
              Visitadas e Atendidas
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#16836F] tabular-nums">
            {countAttended}
          </div>
          <div className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1">
            Reuniões realizadas com sucesso
          </div>
        </div>

        {/* Tab 3: Visitada e não atendida */}
        <div
          onClick={() => setActiveTab('Visitada — não atendida')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer shadow-xs ${
            activeTab === 'Visitada — não atendida'
              ? 'bg-white dark:bg-[#1B272F] border-[#71818B] ring-2 ring-[#71818B]/20'
              : 'bg-white dark:bg-[#1B272F] border-[#E2E9EC] dark:border-[#34434C] hover:border-[#71818B]/60'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase tracking-wider">
              Visitadas — Não Atendidas
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 text-[#71818B] flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-[#71818B] dark:text-[#A8B6BE] tabular-nums">
            {countNotAttended}
          </div>
          <div className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1">
            Tentativas sem contato direto ou ausente
          </div>
        </div>
      </div>

      {/* Action and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar prospect por empresa, contato ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] placeholder-[#71818B] focus:border-[#16836F] outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#202E37] p-1 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs font-semibold overflow-x-auto">
            {(['Todas', 'A visitar', 'Visitada — atendida', 'Visitada — não atendida'] as const).map(
              (tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                    activeTab === tab
                      ? 'bg-white dark:bg-[#1B272F] text-[#16836F] shadow-xs font-bold'
                      : 'text-[#71818B] dark:text-[#A8B6BE] hover:text-[#20313C]'
                  }`}
                >
                  {tab}
                </button>
              )
            )}
          </div>
        </div>

        <button
          onClick={openNewModal}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Cadastrar prospecção</span>
        </button>
      </div>

      {/* Prospects Data Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Compass className="w-10 h-10 text-[#71818B]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Nenhum registro encontrado nesta categoria
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 mb-4">
              Planeje novas visitas comerciais ou alterne as abas superiores.
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#16836F] text-white text-xs font-bold rounded-xl"
            >
              Planejar primeira visita
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Empresa / Cidade</th>
                  <th className="py-3 px-4">Contato</th>
                  <th className="py-3 px-4">Data Prevista / Efetiva</th>
                  <th className="py-3 px-4">Próxima Ação Comercial</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((p) => {
                  const isAttended = p.status === 'Visitada — atendida';
                  const isToVisit = p.status === 'A visitar';

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div className="font-bold">{p.companyName}</div>
                        <div className="text-[10px] text-[#71818B] flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-[#71818B]" />
                          <span>
                            {p.city}/{p.state}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#20313C] dark:text-[#EDF3F5]">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3 text-[#71818B]" />
                          <span>{p.contactName}</span>
                        </div>
                        <div className="text-[10px] text-[#16836F] mt-0.5">
                          {p.phoneOrWhatsapp}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        {p.scheduledDate && (
                          <div>Prev: {formatDateBR(p.scheduledDate)}</div>
                        )}
                        {p.actualDate && (
                          <div className="text-[10px] text-[#16836F] font-semibold">
                            Efetivada: {formatDateBR(p.actualDate)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#20313C] dark:text-[#EDF3F5] max-w-xs">
                        <div className="truncate font-medium">{p.nextAction || '—'}</div>
                        {p.followUpDate && (
                          <div className="text-[10px] text-[#D5A34C] font-semibold">
                            Retorno: {formatDateBR(p.followUpDate)}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <select
                            value={p.status}
                            onChange={(e) =>
                              handleQuickStatusChange(p, e.target.value as ProspectStatus)
                            }
                            className={`text-xs font-semibold px-2 py-1 rounded-md border border-[#E2E9EC] dark:border-[#34434C] bg-white dark:bg-[#1B272F] ${
                              isAttended
                                ? 'text-[#16836F]'
                                : isToVisit
                                ? 'text-[#D5A34C]'
                                : 'text-[#71818B]'
                            }`}
                          >
                            <option value="A visitar">A visitar</option>
                            <option value="Visitada — atendida">Visitada — atendida</option>
                            <option value="Visitada — não atendida">Visitada — não atendida</option>
                          </select>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar prospecção"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir prospecção"
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

      {/* Modal: Form Prospecção */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
                  <Compass className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  {editingProspect ? 'Editar Prospecção Comercial' : 'Cadastrar Prospecção & Visita'}
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
                    Nome da Empresa Prospect *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ex: Indústria Química Bandeirantes"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    CNPJ (se conhecido)
                  </label>
                  <input
                    type="text"
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Status da Visita *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as ProspectStatus })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-semibold outline-hidden focus:border-[#16836F]"
                  >
                    <option value="A visitar">A visitar</option>
                    <option value="Visitada — atendida">Visitada — atendida</option>
                    <option value="Visitada — não atendida">Visitada — não atendida</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Nome do Contato *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Nome do gestor / SESMT"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Telefone ou WhatsApp *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phoneOrWhatsapp}
                    onChange={(e) => setFormData({ ...formData, phoneOrWhatsapp: e.target.value })}
                    placeholder="(11) 98888-9999"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Cidade
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Campinas"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Estado (UF)
                  </label>
                  <input
                    type="text"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    placeholder="SP"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] uppercase outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data Prevista para a Visita
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data Efetiva da Visita
                  </label>
                  <input
                    type="date"
                    value={formData.actualDate}
                    onChange={(e) => setFormData({ ...formData, actualDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Próxima Ação Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.nextAction}
                    onChange={(e) => setFormData({ ...formData, nextAction: e.target.value })}
                    placeholder="Ex: Enviar proposta de NR-35 e agendar retorno telefônico"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Data de Retorno / Follow-up
                  </label>
                  <input
                    type="date"
                    value={formData.followUpDate}
                    onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Responsável
                  </label>
                  <input
                    type="text"
                    value={formData.repName}
                    onChange={(e) => setFormData({ ...formData, repName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Observações e Histórico do Contato
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Informações colhidas na visita, demandas de treinamentos, porte da equipe."
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
                  {editingProspect ? 'Salvar Prospecção' : 'Cadastrar Prospecção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Registro de Prospecção"
        message={`Tem certeza que deseja excluir o registro de "${deleteTarget?.companyName}"?`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={() => {
          if (deleteTarget) {
            deleteProspect(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
