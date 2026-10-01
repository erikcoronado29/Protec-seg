import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cloud,
  CloudOff,
  Database,
  Download,
  FileJson,
  History,
  LogIn,
  LogOut,
  Moon,
  Percent,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsScreen: React.FC = () => {
  const {
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    resetToDemo,
    clearAllData,
    addToast,
    companies,
    budgets,
    trainings,
    expenses,
    assets,
    prospects,
    investments,
    currentUser,
    signInWithGoogle,
    logout,
    pushLocalToFirestore,
    isCloudSynced,
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form states for settings
  const [formSettings, setFormSettings] = useState({
    ratePerKm: settings.ratePerKm,
    ratePerHour: settings.ratePerHour,
    shareProtecPercent: settings.shareProtecPercent,
    shareErikPercent: settings.shareErikPercent,
    investmentReservePercent: settings.investmentReservePercent,
  });

  // Modal dialog states
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [clearModalOpen, setClearModalOpen] = useState(false);
  const [importConfirmModalOpen, setImportConfirmModalOpen] = useState(false);
  const [syncToCloudModalOpen, setSyncToCloudModalOpen] = useState(false);
  const [pendingImportContent, setPendingImportContent] = useState<string | null>(null);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    const sumShares =
      Number(formSettings.shareProtecPercent) + Number(formSettings.shareErikPercent);
    if (sumShares !== 100) {
      addToast(
        `A soma das participações deve ser exatamente 100%. Soma atual: ${sumShares}%.`,
        'error'
      );
      return;
    }

    if (formSettings.investmentReservePercent < 0 || formSettings.investmentReservePercent > 100) {
      addToast('O percentual de reserva deve estar entre 0% e 100%.', 'error');
      return;
    }

    if (formSettings.ratePerKm < 0 || formSettings.ratePerHour < 0) {
      addToast('As tarifas de custo não podem ser negativas.', 'error');
      return;
    }

    const success = updateSettings({
      ratePerKm: Number(formSettings.ratePerKm),
      ratePerHour: Number(formSettings.ratePerHour),
      shareProtecPercent: Number(formSettings.shareProtecPercent),
      shareErikPercent: Number(formSettings.shareErikPercent),
      investmentReservePercent: Number(formSettings.investmentReservePercent),
    });

    if (success) {
      addToast('Parâmetros operacionais e regras financeiras atualizados com sucesso.', 'success');
    }
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setPendingImportContent(content);
      setImportConfirmModalOpen(true);
    };
    reader.readAsText(file);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const executeImport = () => {
    if (!pendingImportContent) return;
    importBackup(pendingImportContent);
    setImportConfirmModalOpen(false);
    setPendingImportContent(null);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs">
        <h2 className="text-xl sm:text-2xl font-extrabold text-[#20313C] dark:text-[#EDF3F5] tracking-tight">
          Configurações, Banco de Dados & Parâmetros
        </h2>
        <p className="text-xs sm:text-sm text-[#71818B] dark:text-[#A8B6BE] mt-1">
          Defina as tarifas padrão, regras de rateio de resultados e gerencie a sincronização em nuvem com o Firebase.
        </p>
      </div>

      {/* Section 0: Firebase Backend Cloud Integration */}
      <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#16836F]/40 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E9EC] dark:border-[#34434C]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
              <Cloud className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
                Armazenamento em Nuvem — Firebase Firestore
              </h3>
              <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
                Persistência centralizada em banco de dados NoSQL corporativo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentUser ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E4F4EF] text-[#16836F] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#16836F]" />
                Conectado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-[#D5A34C] text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#D5A34C]" />
                Modo Local (Desconectado)
              </span>
            )}
          </div>
        </div>

        {/* Cloud Connection Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
            <div className="text-[10px] text-[#71818B]">Projeto Firebase</div>
            <div className="font-bold text-[#20313C] dark:text-[#EDF3F5] truncate mt-0.5">
              gen-lang-client-0122718775
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
            <div className="text-[10px] text-[#71818B]">Banco Firestore</div>
            <div className="font-bold text-[#16836F] truncate mt-0.5" title="ai-studio-protecseggestode-39151714-0b10-4fee-b79a-d7a9f882f349">
              Enterprise Ativo
            </div>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C]">
            <div className="text-[10px] text-[#71818B]">Autenticação</div>
            <div className="font-bold text-[#20313C] dark:text-[#EDF3F5] truncate mt-0.5">
              {currentUser ? currentUser.email : 'Google OAuth'}
            </div>
          </div>
        </div>

        {/* Cloud Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {currentUser ? (
            <>
              <button
                type="button"
                onClick={() => setSyncToCloudModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white text-xs font-bold transition-colors shadow-xs"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Gravar Base Completa no Firestore</span>
              </button>

              <button
                type="button"
                onClick={logout}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 dark:border-red-900/40 text-[#B94949] hover:bg-red-50 text-xs font-bold transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Desconectar</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#153246] hover:bg-[#1c4357] text-white text-xs font-bold transition-colors shadow-xs"
            >
              <LogIn className="w-4 h-4 text-[#38D39F]" />
              <span>Conectar com Conta Google para Salvar na Nuvem</span>
            </button>
          )}
        </div>

        {/* Vercel Integration Guide */}
        <div className="pt-3 border-t border-[#E2E9EC] dark:border-[#34434C] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-bold text-xs text-[#20313C] dark:text-[#EDF3F5] flex items-center gap-1.5">
              <span>▲</span> Sincronização & Deploy na Vercel
            </span>
            <span className="text-[10px] text-[#16836F] font-bold bg-[#E4F4EF] dark:bg-[#16836F]/20 px-2 py-0.5 rounded-md">
              vercel.json configurado
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] text-[11px] text-[#71818B] dark:text-[#A8B6BE] space-y-2 leading-relaxed">
            <p>
              O projeto já possui o arquivo <code>vercel.json</code> com as rotas SPA e o script <code>npm run build</code> configurados para a Vercel.
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[#20313C] dark:text-[#EDF3F5]">
              <li>Conecte seu repositório Git (GitHub ou GitLab) à sua conta da <strong>Vercel</strong>.</li>
              <li>O framework será detectado automaticamente como <strong>Vite</strong> (pasta de saída: <code>dist</code>).</li>
              <li>No painel do <strong>Firebase Console</strong> &gt; <em>Authentication</em> &gt; <em>Settings</em> &gt; <em>Domínios Autorizados</em>, adicione o seu domínio da Vercel (ex: <code>seu-app.vercel.app</code>) para habilitar o login Google em produção.</li>
            </ol>
          </div>
        </div>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Section 1: Cost Parameters */}
        <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E9EC] dark:border-[#34434C]">
            <div className="w-8 h-8 rounded-lg bg-[#E4F4EF] dark:bg-[#16836F]/20 text-[#16836F] flex items-center justify-center font-bold">
              <Settings className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
                Parâmetros Operacionais de Custos Diretos
              </h3>
              <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
                Tarifas padrão sugeridas no cadastro de novos treinamentos
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                Tarifa Padrão por KM Rodado (R$)
              </label>
              <input
                type="number"
                step="0.05"
                min={0}
                required
                value={formSettings.ratePerKm}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, ratePerKm: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-bold tabular-nums outline-hidden focus:border-[#16836F]"
              />
              <p className="text-[10px] text-[#71818B] mt-1">
                Exemplo inicial: R$ 1,50/km. Multiplicado pela quilometragem informada pelo usuário.
              </p>
            </div>

            <div>
              <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                Custo Padrão por Hora-Homem (R$)
              </label>
              <input
                type="number"
                step="1.00"
                min={0}
                required
                value={formSettings.ratePerHour}
                onChange={(e) =>
                  setFormSettings({ ...formSettings, ratePerHour: Number(e.target.value) })
                }
                className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#20313C] dark:text-[#EDF3F5] font-bold tabular-nums outline-hidden focus:border-[#16836F]"
              />
              <p className="text-[10px] text-[#71818B] mt-1">
                Exemplo inicial: R$ 60,00/hora. Multiplicado pelas horas trabalhadas do instrutor.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] flex items-start gap-3 text-xs text-[#20313C] dark:text-[#EDF3F5]">
            <History className="w-4 h-4 text-[#16836F] shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Proteção de Consistência Histórica:</span>
              <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE] mt-0.5 leading-relaxed">
                Ao alterar essas tarifas, os novos valores serão aplicados nos cadastros futuros. Os
                treinamentos passados já concluídos preservam as tarifas gravadas na data de realização,
                garantindo que relatórios fiscais e gerenciais históricos não sejam alterados silenciosamente.
              </p>
            </div>
          </div>
        </div>

        {/* Section 2: Profit Division Rules */}
        <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E9EC] dark:border-[#34434C]">
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/30 text-[#D5A34C] flex items-center justify-center font-bold">
              <Percent className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
                Regra de Divisão dos Resultados
              </h3>
              <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
                Percentuais de rateio do lucro líquido entre Protec Seg e Erik Coronado
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                Participação Protec Seg (%) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={formSettings.shareProtecPercent}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    shareProtecPercent: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#16836F] font-bold text-base tabular-nums outline-hidden focus:border-[#16836F]"
              />
              <span className="text-[10px] text-[#71818B]">Padrão: 50%</span>
            </div>

            <div>
              <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                Participação Erik Coronado (%) *
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={formSettings.shareErikPercent}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    shareErikPercent: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#16836F] font-bold text-base tabular-nums outline-hidden focus:border-[#16836F]"
              />
              <span className="text-[10px] text-[#71818B]">Padrão: 50%</span>
            </div>

            <div>
              <label className="block font-semibold text-[#20313C] dark:text-[#EDF3F5] mb-1">
                Reserva para Investimentos (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={formSettings.investmentReservePercent}
                onChange={(e) =>
                  setFormSettings({
                    ...formSettings,
                    investmentReservePercent: Number(e.target.value),
                  })
                }
                className="w-full p-2.5 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] bg-[#F8FAFB] dark:bg-[#202E37] text-[#D5A34C] font-bold text-base tabular-nums outline-hidden focus:border-[#16836F]"
              />
              <span className="text-[10px] text-[#71818B]">
                Retenção sobre o lucro antes da divisão (Padrão: 0%)
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-xs text-[#71818B]">
              Soma das participações:{' '}
              <strong>
                {Number(formSettings.shareProtecPercent) + Number(formSettings.shareErikPercent)}%
              </strong>{' '}
              (obrigatório 100%)
            </span>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#16836F] hover:bg-[#126b5a] text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Parâmetros</span>
            </button>
          </div>
        </div>
      </form>

      {/* Section 3: Backup and Restore */}
      <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b border-[#E2E9EC] dark:border-[#34434C]">
          <div className="w-8 h-8 rounded-lg bg-[#153246] text-[#E4F4EF] flex items-center justify-center font-bold">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Backup Local em Arquivo JSON
            </h3>
            <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
              Exporte seus dados em arquivo JSON para cópia de segurança física
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={exportBackup}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[#16836F] text-[#16836F] hover:bg-[#E4F4EF] dark:hover:bg-[#16836F]/10 text-xs font-bold transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar Backup (JSON)</span>
          </button>

          <input
            type="file"
            accept=".json"
            ref={fileInputRef}
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-[#E2E9EC] dark:border-[#34434C] text-[#20313C] dark:text-[#EDF3F5] hover:bg-[#F8FAFB] dark:hover:bg-[#202E37] text-xs font-bold transition-colors"
          >
            <Upload className="w-4 h-4 text-[#1C4357]" />
            <span>Restaurar Backup de Arquivo</span>
          </button>
        </div>
      </div>

      {/* Section 4: Demo Data Management */}
      <div className="bg-white dark:bg-[#1B272F] p-5 sm:p-6 rounded-2xl border border-[#E2E9EC] dark:border-[#34434C] shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#E2E9EC] dark:border-[#34434C]">
          <div>
            <h3 className="text-sm font-bold text-[#20313C] dark:text-[#EDF3F5]">
              Gestão da Base Demonstrativa
            </h3>
            <p className="text-[11px] text-[#71818B] dark:text-[#A8B6BE]">
              Restaurar registros didáticos iniciais ou iniciar operação com base vazia
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-[#F8FAFB] dark:bg-[#202E37] border border-[#E2E9EC] dark:border-[#34434C] text-[#20313C] dark:text-[#EDF3F5] hover:bg-[#F4F7F8] text-xs font-semibold"
          >
            <RefreshCw className="w-4 h-4 text-[#16836F]" />
            <span>Restaurar Dados Demonstrativos Didáticos</span>
          </button>

          <button
            type="button"
            onClick={() => setClearModalOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 text-[#B94949] hover:bg-red-100 text-xs font-bold"
          >
            <Trash2 className="w-4 h-4" />
            <span>Limpar Todos os Registros (Base Vazia)</span>
          </button>
        </div>
      </div>

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={resetModalOpen}
        title="Restaurar Dados de Exemplo"
        message="Deseja recarregar os registros demonstrativos iniciais? Dados não salvos em backup poderão ser substituídos."
        confirmLabel="Sim, restaurar exemplo"
        onConfirm={() => {
          resetToDemo();
          setResetModalOpen(false);
        }}
        onCancel={() => setResetModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={clearModalOpen}
        title="Limpar Toda a Base de Dados"
        message="Tem certeza que deseja apagar todos os registros (empresas, orçamentos, treinamentos, despesas e patrimônio) para iniciar a operação oficial com a base limpa?"
        confirmLabel="Sim, limpar tudo"
        isDanger={true}
        onConfirm={() => {
          clearAllData();
          setClearModalOpen(false);
        }}
        onCancel={() => setClearModalOpen(false)}
      />

      <ConfirmationModal
        isOpen={importConfirmModalOpen}
        title="Confirmar Restauração de Backup"
        message="A importação substituirá os registros atuais pelos dados contidos no arquivo JSON selecionado. Deseja prosseguir?"
        confirmLabel="Substituir e Restaurar"
        isDanger={true}
        onConfirm={executeImport}
        onCancel={() => {
          setImportConfirmModalOpen(false);
          setPendingImportContent(null);
        }}
      />

      <ConfirmationModal
        isOpen={syncToCloudModalOpen}
        title="Gravar Dados no Firebase Firestore"
        message="Deseja sincronizar e gravar todos os dados cadastrais (empresas, orçamentos, treinamentos, despesas, bens e investimentos) diretamente no seu banco de dados Firebase na nuvem?"
        confirmLabel="Sim, Gravar no Firestore"
        onConfirm={() => {
          pushLocalToFirestore();
          setSyncToCloudModalOpen(false);
        }}
        onCancel={() => setSyncToCloudModalOpen(false)}
      />
    </div>
  );
};
