import {
  Calendar,
  ChevronDown,
  Cloud,
  CloudOff,
  GraduationCap,
  Info,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Plus,
  RefreshCw,
  Sun,
  UserCheck,
} from 'lucide-react';
import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MONTH_NAMES_PT } from '../../utils/finance';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const {
    activeScreen,
    selectedYear,
    selectedMonth,
    setSelectedPeriod,
    settings,
    updateSettings,
    setModalNewTrainingOpen,
    currentUser,
    authLoading,
    signInWithGoogle,
    logout,
    pushLocalToFirestore,
  } = useApp();

  const [periodDropdownOpen, setPeriodDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const getScreenDetails = () => {
    switch (activeScreen) {
      case 'dashboard':
        return { group: 'Gestão', title: 'Visão Geral' };
      case 'empresas':
        return { group: 'Gestão', title: 'Empresas Clientes' };
      case 'orcamentos':
        return { group: 'Gestão', title: 'Orçamentos e Propostas' };
      case 'treinamentos':
        return { group: 'Gestão', title: 'Gestão de Treinamentos' };
      case 'prospeccao':
        return { group: 'Gestão', title: 'Prospecção e Visitas' };
      case 'financeiro':
        return { group: 'Administrativo', title: 'Financeiro e Custos' };
      case 'patrimonio':
        return { group: 'Administrativo', title: 'Patrimônio e Bens' };
      case 'investimentos':
        return { group: 'Administrativo', title: 'Investimentos e Aquisições' };
      case 'relatorios':
        return { group: 'Administrativo', title: 'Central de Relatórios PDF' };
      case 'configuracoes':
        return { group: 'Administrativo', title: 'Configurações e Parâmetros' };
      default:
        return { group: 'Protec Seg', title: 'Painel' };
    }
  };

  const details = getScreenDetails();
  const years = [2025, 2026, 2027];
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <header className="h-16 shrink-0 bg-white dark:bg-[#1B272F] border-b border-[#E2E9EC] dark:border-[#34434C] px-4 md:px-6 flex items-center justify-between z-10 transition-colors">
      {/* Left zone: Mobile toggle & Breadcrumb */}
      <div className="flex items-center gap-3 md:gap-4 min-w-0">
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden p-2 text-[#71818B] hover:text-[#20313C] dark:hover:text-[#EDF3F5] rounded-lg hover:bg-[#F4F7F8] dark:hover:bg-[#202E37]"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex flex-col min-w-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
            <span>Protec Seg</span>
            <span>/</span>
            <span>{details.group}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#20313C] dark:text-[#EDF3F5] truncate leading-tight">
            {details.title}
          </h1>
        </div>
      </div>

      {/* Right zone: Period Selector, Firebase Connection, Theme toggle, Action button, User */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Firebase Cloud Connection Status */}
        {currentUser ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#16836F]/40 bg-[#E4F4EF]/60 dark:bg-[#16836F]/20 text-[#16836F] text-xs font-semibold hover:border-[#16836F] transition-colors"
              title="Firebase Conectado"
            >
              <Cloud className="w-3.5 h-3.5 text-[#16836F]" />
              <span className="hidden lg:inline text-[11px] truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-3 h-3 text-[#16836F]" />
            </button>

            {userDropdownOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-[#1B272F] border border-[#E2E9EC] dark:border-[#34434C] rounded-xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-100 text-xs">
                <div className="font-bold text-[#20313C] dark:text-[#EDF3F5] pb-1 border-b border-[#E2E9EC] dark:border-[#34434C] flex items-center justify-between">
                  <span>Firebase Conectado</span>
                  <span className="w-2 h-2 rounded-full bg-[#16836F]" />
                </div>
                <div className="py-2 text-[11px] text-[#71818B] dark:text-[#A8B6BE] truncate">
                  {currentUser.email}
                </div>
                <div className="space-y-1.5 pt-1">
                  <button
                    onClick={() => {
                      pushLocalToFirestore();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#F8FAFB] dark:bg-[#202E37] hover:bg-[#E4F4EF] text-[#20313C] dark:text-[#EDF3F5] text-left font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#16836F]" />
                    <span>Gravar Dados no Firestore</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-[#B94949] text-left font-medium transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Desconectar Conta</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={signInWithGoogle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-xs font-semibold text-[#20313C] dark:text-[#EDF3F5] hover:border-[#16836F] transition-colors"
            title="Conectar com o Google para salvar no Firebase"
          >
            <CloudOff className="w-3.5 h-3.5 text-[#D5A34C]" />
            <span className="hidden md:inline">Salvar no Firebase</span>
          </button>
        )}

        {/* Period Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setPeriodDropdownOpen(!periodDropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-xs font-semibold text-[#20313C] dark:text-[#EDF3F5] hover:border-[#16836F] transition-colors"
            title="Selecionar período de competência"
          >
            <Calendar className="w-3.5 h-3.5 text-[#16836F]" />
            <span className="hidden sm:inline">
              {MONTH_NAMES_PT[selectedMonth - 1]} de {selectedYear}
            </span>
            <span className="sm:hidden">
              {selectedMonth}/{String(selectedYear).slice(-2)}
            </span>
            <ChevronDown className="w-3 h-3 text-[#71818B]" />
          </button>

          {periodDropdownOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white dark:bg-[#1B272F] border border-[#E2E9EC] dark:border-[#34434C] rounded-xl shadow-xl p-3 z-30 animate-in fade-in zoom-in-95 duration-100">
              <div className="text-[11px] font-bold text-[#71818B] dark:text-[#A8B6BE] uppercase mb-2">
                Selecionar Período
              </div>
              <div className="grid grid-cols-2 gap-2 mb-3">
                <div>
                  <label className="block text-[10px] text-[#71818B] mb-1">Mês</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedPeriod(selectedYear, Number(e.target.value))}
                    className="w-full text-xs font-medium bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] rounded-lg p-1.5 text-[#20313C] dark:text-[#EDF3F5]"
                  >
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {MONTH_NAMES_PT[m - 1]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-[#71818B] mb-1">Ano</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedPeriod(Number(e.target.value), selectedMonth)}
                    className="w-full text-xs font-medium bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] rounded-lg p-1.5 text-[#20313C] dark:text-[#EDF3F5]"
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-[#E2E9EC] dark:border-[#34434C]">
                <button
                  onClick={() => {
                    const now = new Date();
                    setSelectedPeriod(now.getFullYear(), now.getMonth() + 1);
                    setPeriodDropdownOpen(false);
                  }}
                  className="text-[11px] text-[#16836F] hover:underline font-semibold"
                >
                  Mês Atual
                </button>
                <button
                  onClick={() => setPeriodDropdownOpen(false)}
                  className="px-2.5 py-1 text-xs bg-[#16836F] text-white rounded-md font-medium"
                >
                  Concluir
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Demo indicator tag */}
        {settings.isDemoData && !currentUser && (
          <div
            className="hidden xl:flex items-center gap-1.5 text-[11px] font-medium text-[#71818B] dark:text-[#A8B6BE] bg-[#F8FAFB] dark:bg-[#202E37] px-2 py-1 rounded-md border border-[#E2E9EC] dark:border-[#34434C]"
            title="Valores demonstrativos de exemplo. Podem ser gravados no Firebase ao conectar."
          >
            <Info className="w-3.5 h-3.5 text-[#D5A34C]" />
            <span>Dados demonstrativos</span>
          </div>
        )}

        {/* Dark/Light mode toggle */}
        <button
          onClick={() => updateSettings({ darkMode: !settings.darkMode })}
          className="p-2 rounded-lg text-[#71818B] dark:text-[#A8B6BE] hover:text-[#20313C] dark:hover:text-[#EDF3F5] hover:bg-[#F4F7F8] dark:hover:bg-[#202E37] transition-colors"
          title={settings.darkMode ? 'Alternar para Modo Claro' : 'Alternar para Modo Escuro'}
          aria-label="Alternar tema"
        >
          {settings.darkMode ? <Sun className="w-4 h-4 text-[#D5A34C]" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action Button: "+ Novo treinamento" */}
        <button
          onClick={() => setModalNewTrainingOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Novo treinamento</span>
          <span className="sm:hidden">Novo</span>
        </button>

        {/* User initials */}
        <div
          className="w-8 h-8 rounded-full bg-[#153246] text-[#E4F4EF] font-bold text-xs flex items-center justify-center border border-[#1C4357] shrink-0"
          title={currentUser ? `Conectado como ${currentUser.email}` : 'Erik Coronado — Responsável'}
        >
          {currentUser?.displayName ? currentUser.displayName.slice(0, 2).toUpperCase() : 'EC'}
        </div>
      </div>
    </header>
  );
};
