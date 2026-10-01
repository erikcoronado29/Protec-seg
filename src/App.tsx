import React, { useState } from 'react';
import { ToastContainer } from './components/common/ToastContainer';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { AssetsScreen } from './components/screens/AssetsScreen';
import { BudgetsScreen } from './components/screens/BudgetsScreen';
import { CompaniesScreen } from './components/screens/CompaniesScreen';
import { DashboardScreen } from './components/screens/DashboardScreen';
import { FinancialScreen } from './components/screens/FinancialScreen';
import { InvestmentsScreen } from './components/screens/InvestmentsScreen';
import { ProspectsScreen } from './components/screens/ProspectsScreen';
import { ReportsScreen } from './components/screens/ReportsScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { TrainingsScreen } from './components/screens/TrainingsScreen';
import { AppProvider, useApp } from './context/AppContext';

const AppContent: React.FC = () => {
  const { activeScreen } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderScreen = () => {
    switch (activeScreen) {
      case 'dashboard':
        return <DashboardScreen />;
      case 'empresas':
        return <CompaniesScreen />;
      case 'orcamentos':
        return <BudgetsScreen />;
      case 'treinamentos':
        return <TrainingsScreen />;
      case 'prospeccao':
        return <ProspectsScreen />;
      case 'financeiro':
        return <FinancialScreen />;
      case 'patrimonio':
        return <AssetsScreen />;
      case 'investimentos':
        return <InvestmentsScreen />;
      case 'relatorios':
        return <ReportsScreen />;
      case 'configuracoes':
        return <SettingsScreen />;
      default:
        return <DashboardScreen />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F4F7F8] dark:bg-[#111A20] text-[#20313C] dark:text-[#EDF3F5] transition-colors">
      {/* Sidebar navigation */}
      <Sidebar
        isOpenMobile={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        {/* Viewport Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-[1600px] mx-auto pb-12">
            {renderScreen()}
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
