import {
  Boxes,
  Building2,
  Compass,
  DollarSign,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  LayoutDashboard,
  Settings,
  TrendingUp,
  X,
} from 'lucide-react';
import React from 'react';
import { useApp } from '../../context/AppContext';
import { ScreenId } from '../../types';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  countBadge?: number;
}

interface NavGroup {
  groupName: string;
  items: NavItem[];
}

export const Sidebar: React.FC<{ isOpenMobile: boolean; onCloseMobile: () => void }> = ({
  isOpenMobile,
  onCloseMobile,
}) => {
  const {
    activeScreen,
    setActiveScreen,
    companies,
    budgets,
    trainings,
    prospects,
    investments,
  } = useApp();

  const groups: NavGroup[] = [
    {
      groupName: 'GESTÃO',
      items: [
        { id: 'dashboard', label: 'Visão geral', icon: LayoutDashboard },
        {
          id: 'empresas',
          label: 'Empresas',
          icon: Building2,
          countBadge: companies.length,
        },
        {
          id: 'orcamentos',
          label: 'Orçamentos',
          icon: FileSpreadsheet,
          countBadge: budgets.filter((b) => b.status === 'Enviado' || b.status === 'Rascunho').length,
        },
        {
          id: 'treinamentos',
          label: 'Treinamentos',
          icon: GraduationCap,
          countBadge: trainings.filter((t) => t.status === 'Realizado').length,
        },
        {
          id: 'prospeccao',
          label: 'Prospecção e visitas',
          icon: Compass,
          countBadge: prospects.filter((p) => p.status === 'A visitar').length,
        },
      ],
    },
    {
      groupName: 'ADMINISTRATIVO',
      items: [
        { id: 'financeiro', label: 'Financeiro e custos', icon: DollarSign },
        { id: 'patrimonio', label: 'Patrimônio e bens', icon: Boxes },
        {
          id: 'investimentos',
          label: 'Investimentos',
          icon: TrendingUp,
          countBadge: investments.filter((i) => i.status !== 'Adquirido').length,
        },
        { id: 'relatorios', label: 'Relatórios PDF', icon: FileText },
        { id: 'configuracoes', label: 'Configurações', icon: Settings },
      ],
    },
  ];

  const handleNavClick = (screenId: ScreenId) => {
    setActiveScreen(screenId);
    onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-[#153246] text-[#EDF3F5] select-none">
      {/* Brand Header */}
      <div className="h-18 flex items-center justify-between px-5 border-b border-[#1C4357]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#16836F] flex items-center justify-center font-bold text-xl text-white shadow-sm shrink-0">
            P
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-[15px] tracking-wider text-white leading-tight">
              PROTEC SEG
            </span>
            <span className="text-[10px] uppercase font-semibold tracking-wider text-[#A8B6BE]">
              GESTÃO DE TREINAMENTOS
            </span>
          </div>
        </div>
        <button
          onClick={onCloseMobile}
          className="md:hidden p-1.5 text-[#A8B6BE] hover:text-white rounded-md hover:bg-[#1C4357]"
          aria-label="Fechar menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-6">
        {groups.map((group) => (
          <div key={group.groupName} className="space-y-1">
            <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-[#71818B] uppercase">
              {group.groupName}
            </div>
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = activeScreen === item.id;
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative ${
                      isActive
                        ? 'bg-[#16836F] text-white shadow-sm font-semibold'
                        : 'text-[#A8B6BE] hover:text-white hover:bg-[#1C4357]'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-white rounded-r-full" />
                    )}
                    <div className="flex items-center gap-3 truncate">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 transition-colors ${
                          isActive ? 'text-white' : 'text-[#71818B] group-hover:text-white'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.countBadge !== undefined && item.countBadge > 0 && (
                      <span
                        className={`text-[11px] px-1.5 py-0.5 rounded-full tabular-nums font-semibold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : 'bg-[#1C4357] text-[#A8B6BE] group-hover:text-white'
                        }`}
                      >
                        {item.countBadge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User profile footer */}
      <div className="p-3.5 border-t border-[#1C4357] bg-[#112433]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#1C4357] border border-[#2B5770] flex items-center justify-center font-bold text-xs text-[#E4F4EF] shrink-0">
            EC
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-bold text-white truncate">Erik Coronado</span>
            <span className="text-[11px] text-[#A8B6BE] truncate">Sócio & Resp. Técnico</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop fixed sidebar (248px) */}
      <aside className="hidden md:block w-[248px] shrink-0 h-screen sticky top-0 border-r border-[#1C4357] z-20 print:hidden">
        {content}
      </aside>

      {/* Mobile drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex print:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-[270px] max-w-[85vw] h-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
