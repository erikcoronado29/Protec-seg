import {
  AlertCircle,
  Building2,
  CheckCircle,
  Edit2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Search,
  Trash2,
  User,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Company, CompanyStatus } from '../../types';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const CompaniesScreen: React.FC = () => {
  const {
    companies,
    addCompany,
    updateCompany,
    deleteCompany,
    inactivateCompany,
    budgets,
    trainings,
    addToast,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | CompanyStatus>('Todas');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    contactName: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    city: '',
    state: 'SP',
    cep: '',
    commercialRep: 'Erik Coronado',
    status: 'Ativa' as CompanyStatus,
    notes: '',
  });

  // Delete Safeguard Dialog
  const [deleteTarget, setDeleteTarget] = useState<Company | null>(null);
  const [linkedWarning, setLinkedWarning] = useState<{
    count: number;
    company: Company;
  } | null>(null);

  const openNewModal = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      cnpj: '',
      contactName: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      city: '',
      state: 'SP',
      cep: '',
      commercialRep: 'Erik Coronado',
      status: 'Ativa',
      notes: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setFormData({
      name: comp.name,
      cnpj: comp.cnpj,
      contactName: comp.contactName,
      phone: comp.phone,
      whatsapp: comp.whatsapp || '',
      email: comp.email,
      address: comp.address,
      city: comp.city,
      state: comp.state,
      cep: comp.cep,
      commercialRep: comp.commercialRep,
      status: comp.status,
      notes: comp.notes || '',
    });
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('O nome ou razão social da empresa é obrigatório.', 'error');
      return;
    }

    if (!formData.contactName.trim()) {
      addToast('O nome do contato principal é obrigatório.', 'error');
      return;
    }

    if (!formData.phone.trim()) {
      addToast('O telefone ou WhatsApp é obrigatório.', 'error');
      return;
    }

    if (editingCompany) {
      updateCompany(editingCompany.id, formData);
    } else {
      addCompany(formData);
    }

    setModalOpen(false);
  };

  const handleDeleteRequest = (comp: Company) => {
    const linkedB = budgets.filter((b) => b.companyId === comp.id).length;
    const linkedT = trainings.filter((t) => t.companyId === comp.id).length;
    const totalLinked = linkedB + linkedT;

    if (totalLinked > 0) {
      setLinkedWarning({ count: totalLinked, company: comp });
    } else {
      setDeleteTarget(comp);
    }
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    deleteCompany(deleteTarget.id);
    setDeleteTarget(null);
  };

  // Filter companies
  const filtered = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cnpj.includes(searchTerm) ||
      c.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'Todas' || c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Top action & filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#1B272F] p-4 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#71818B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por razão social, CNPJ, contato ou cidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] placeholder-[#71818B] focus:border-[#16836F] outline-hidden"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center gap-1 bg-[#F8FAFB] dark:bg-[#202E37] p-1 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs font-semibold">
            {(['Todas', 'Ativa', 'Inativa', 'Prospect'] as const).map((st) => (
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
          <span>Cadastrar empresa</span>
        </button>
      </div>

      {/* Companies Data Table */}
      <div className="bg-white dark:bg-[#1B272F] rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Building2 className="w-10 h-10 text-[#71818B]/50 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Nenhuma empresa localizada
            </h3>
            <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 mb-4">
              Ajuste os filtros de busca ou cadastre uma nova empresa cliente.
            </p>
            <button
              onClick={openNewModal}
              className="px-4 py-2 bg-[#16836F] text-white text-xs font-bold rounded-xl"
            >
              Cadastrar primeira empresa
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAFB] dark:bg-[#202E37] text-[#71818B] dark:text-[#A8B6BE] uppercase text-[10px] font-bold tracking-wider border-b border-[#E2E9EC] dark:border-[#34434C]">
                <tr>
                  <th className="py-3 px-4">Empresa / Razão Social</th>
                  <th className="py-3 px-4">CNPJ</th>
                  <th className="py-3 px-4">Contato Principal</th>
                  <th className="py-3 px-4">Telefone / WhatsApp</th>
                  <th className="py-3 px-4">Cidade / UF</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E9EC] dark:divide-[#34434C]">
                {filtered.map((comp) => {
                  const isActive = comp.status === 'Ativa';
                  const isProspect = comp.status === 'Prospect';

                  return (
                    <tr
                      key={comp.id}
                      className="hover:bg-[#F8FAFB]/70 dark:hover:bg-[#202E37]/50 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-semibold text-[#20313C] dark:text-[#EDF3F5]">
                        <div>{comp.name}</div>
                        {comp.commercialRep && (
                          <div className="text-[10px] text-[#71818B] font-normal">
                            Resp: {comp.commercialRep}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        {comp.cnpj || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#20313C] dark:text-[#EDF3F5]">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3 h-3 text-[#71818B]" />
                          <span>{comp.contactName}</span>
                        </div>
                        {comp.email && (
                          <div className="text-[10px] text-[#71818B] truncate max-w-[160px]">
                            {comp.email}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] tabular-nums whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#16836F]" />
                          <span>{comp.phone}</span>
                        </div>
                        {comp.whatsapp && comp.whatsapp !== comp.phone && (
                          <div className="text-[10px] text-[#16836F]">
                            Whats: {comp.whatsapp}
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[#71818B] dark:text-[#A8B6BE] whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#71818B]" />
                          <span>
                            {comp.city}/{comp.state}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-[11px] font-semibold ${
                            isActive
                              ? 'text-[#16836F]'
                              : isProspect
                              ? 'text-[#D5A34C]'
                              : 'text-[#71818B]'
                          }`}
                        >
                          {comp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openEditModal(comp)}
                            className="p-1.5 text-[#71818B] hover:text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/20 rounded-lg transition-colors"
                            title="Editar empresa"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteRequest(comp)}
                            className="p-1.5 text-[#71818B] hover:text-[#B94949] hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
                            title="Excluir empresa"
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

      {/* Modal: Cadastro / Edição de Empresa */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-4.5 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  {editingCompany ? 'Editar Empresa Cliente' : 'Cadastrar Nova Empresa'}
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
                    Razão Social ou Nome Fantasia *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Construtora Silva & Ramos Ltda"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    CNPJ
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
                    Status do Relacionamento
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as CompanyStatus })
                    }
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  >
                    <option value="Ativa">Ativa</option>
                    <option value="Prospect">Prospect</option>
                    <option value="Inativa">Inativa</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Contato Principal *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Nome do gestor ou SESMT"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    E-mail
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="contato@empresa.com.br"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(11) 3333-4444"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    WhatsApp (se diferente)
                  </label>
                  <input
                    type="text"
                    value={formData.whatsapp}
                    onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                    placeholder="(11) 98888-7777"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Endereço
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Logradouro, número, complemento"
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
                    placeholder="São Paulo"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
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
                      CEP
                    </label>
                    <input
                      type="text"
                      value={formData.cep}
                      onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
                      className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Responsável Comercial
                  </label>
                  <input
                    type="text"
                    value={formData.commercialRep}
                    onChange={(e) => setFormData({ ...formData, commercialRep: e.target.value })}
                    placeholder="Erik Coronado"
                    className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] outline-hidden focus:border-[#16836F]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                    Observações Internas
                  </label>
                  <textarea
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Detalhes adicionais sobre instalações, requisitos normativos ou histórico."
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
                  {editingCompany ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Direct Delete */}
      <ConfirmationModal
        isOpen={deleteTarget !== null}
        title="Excluir Empresa"
        message={`Tem certeza que deseja excluir "${deleteTarget?.name}"? Esta ação removerá o cadastro do sistema.`}
        confirmLabel="Sim, excluir"
        isDanger={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Safeguard Dialog for Linked Records */}
      {linkedWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white dark:bg-[#1B272F] rounded-2xl shadow-2xl border border-[#E2E9EC] dark:border-[#34434C] p-5">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-[#D5A34C] flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#20313C] dark:text-[#EDF3F5]">
                  Registros Vinculados Detectados
                </h3>
                <p className="text-xs text-[#71818B] dark:text-[#A8B6BE] mt-1 leading-relaxed">
                  A empresa <strong>"{linkedWarning.company.name}"</strong> está associada a{' '}
                  <strong>{linkedWarning.count}</strong> orçamento(s) ou treinamento(s). Para preservar a
                  integridade do histórico financeiro e operacional, o sistema não permite a exclusão direta.
                </p>
              </div>
            </div>

            <div className="bg-[#F8FAFB] dark:bg-[#202E37] p-3 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-xs text-[#20313C] dark:text-[#EDF3F5] mb-4">
              <strong>Ação recomendada:</strong> Alterar o status para <em>Inativa</em>. Dessa forma, ela não
              aparecerá em novas propostas, mas todo o histórico permanecerá intacto.
            </div>

            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setLinkedWarning(null)}
                className="px-3.5 py-2 text-xs font-semibold text-[#71818B] border border-[#E2E9EC] dark:border-[#34434C] rounded-lg"
              >
                Voltar
              </button>
              <button
                type="button"
                onClick={() => {
                  inactivateCompany(linkedWarning.company.id);
                  setLinkedWarning(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-[#16836F] hover:bg-[#126b5a] rounded-lg"
              >
                Inativar Empresa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
