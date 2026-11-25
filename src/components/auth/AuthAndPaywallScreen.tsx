import React, { useState } from 'react';
import {
  Lock,
  Mail,
  User,
  Award,
  Eye,
  EyeOff,
  AlertTriangle,
  CreditCard,
  QrCode,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Sun,
  Moon,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';
import { authService } from '../../services/authService';
import {
  AuthSession,
  ExpiredAccountPreview,
  SubscriptionPlan,
} from '../../types/auth';

type AuthViewMode = 'login' | 'register' | 'payment';

interface AuthAndPaywallScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAuthenticated: (session: AuthSession) => void;
  initialMode?: AuthViewMode;
  existingSession?: AuthSession | null;
  onCancelUpgrade?: () => void;
}

export const AuthAndPaywallScreen: React.FC<AuthAndPaywallScreenProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onAuthenticated,
  initialMode = 'login',
  existingSession,
  onCancelUpgrade,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const isEn = lang === 'en';

  const [viewMode, setViewMode] = useState<AuthViewMode>(initialMode);

  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [expiredAccount, setExpiredAccount] = useState<ExpiredAccountPreview | null>(
    existingSession
      ? {
          id: existingSession.accountId,
          name: existingSession.name,
          crm: existingSession.crm,
          email: existingSession.email,
          trialEndsAt: existingSession.trialEndsAt,
        }
      : null
  );

  // Register state
  const [regName, setRegName] = useState('');
  const [regCrm, setRegCrm] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);

  // Payment state
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix'>('card');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setExpiredAccount(null);

    const res = authService.login(loginEmail, loginPassword, lang);
    if (res.ok) {
      onAuthenticated(res.session);
      return;
    }

    setLoginError(res.message);
    if (res.reason === 'SUBSCRIPTION_EXPIRED') {
      setExpiredAccount(res.account);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const res = authService.register(
      {
        name: regName,
        crm: regCrm,
        email: regEmail,
        password: regPassword,
      },
      lang
    );

    if (!res.ok) {
      setRegError(res.message);
      return;
    }

    onAuthenticated(res.session);
  };

  const handleConfirmSimulatedPayment = () => {
    const targetId = expiredAccount?.id || existingSession?.accountId;
    if (!targetId) {
      setViewMode('login');
      return;
    }
    const updatedSession = authService.activateSubscription(targetId, selectedPlan);
    if (updatedSession) {
      onAuthenticated(updatedSession);
    }
  };

  const handleFillTestAccount = (type: 'trial' | 'expired') => {
    setLoginError(null);
    setExpiredAccount(null);
    setViewMode('login');
    if (type === 'trial') {
      setLoginEmail('dra.demo@ultraimed.com');
      setLoginPassword('123456');
    } else {
      setLoginEmail('expirado@ultraimed.com');
      setLoginPassword('123456');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar minimal */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm shrink-0 bg-[#054A46]">
              <img
                src="/assets/aistudio/Gemini_Generated_Image_i9cl7oi9cl7oi9cl_4fdc7ed6.jfif"
                alt="UltrAI Med"
                className="w-full h-full object-cover scale-[1.08]"
              />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight">UltrAI Med</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1.5 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
              <span className="font-mono uppercase">{lang}</span>
            </button>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={t.nav.toggleTheme}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Header inside card */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-md bg-[#054A46]">
                <img
                  src="/assets/aistudio/Gemini_Generated_Image_i9cl7oi9cl7oi9cl_4fdc7ed6.jfif"
                  alt="UltrAI Med"
                  className="w-full h-full object-cover scale-[1.08]"
                />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {viewMode === 'payment'
                  ? isEn
                    ? 'Activate UltrAI Med Subscription'
                    : 'Assinatura UltrAI Med'
                  : viewMode === 'register'
                    ? isEn
                      ? 'Create Medical Account'
                      : 'Criar Conta Médica'
                    : isEn
                      ? 'Sign in to UltrAI Med'
                      : 'Acessar o UltrAI Med'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {viewMode === 'payment'
                  ? isEn
                    ? 'Monthly access to AI reporting, reference measurements, and clinical copilot.'
                    : 'Acesso completo a laudos com IA, tabela de medidas e copiloto clínico.'
                  : isEn
                    ? '3-day free trial included for new medical accounts.'
                    : 'Teste completo por 3 dias grátis para novas contas médicas.'}
              </p>

              {/* Mode switcher between Login & Register (hidden in payment view) */}
              {viewMode !== 'payment' && (
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl mt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('login');
                      setRegError(null);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                      viewMode === 'login'
                        ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {isEn ? 'Sign In' : 'Entrar'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('register');
                      setLoginError(null);
                      setExpiredAccount(null);
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors ${
                      viewMode === 'register'
                        ? 'bg-white dark:bg-slate-700 text-teal-900 dark:text-cyan-300 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                    }`}
                  >
                    {isEn ? '3 Days Free' : '3 Dias Grátis'}
                  </button>
                </div>
              )}
            </div>

            {/* VIEW 1: LOGIN */}
            {viewMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Email' : 'E-mail profissional'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="medico@clinica.com"
                      className="w-full text-sm pl-9 pr-3 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Password' : 'Senha'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-sm pl-9 pr-10 py-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                      aria-label={isEn ? 'Toggle password visibility' : 'Mostrar ou ocultar senha'}
                    >
                      {showLoginPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error on login — if subscription expired, shows direct redirect CTA to payment */}
                {loginError && (
                  <div
                    role="alert"
                    className={`p-3.5 rounded-xl border text-xs space-y-2.5 ${
                      expiredAccount
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
                        : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold">
                          {expiredAccount
                            ? isEn
                              ? 'Free Trial Expired / Subscription Required'
                              : 'Período Grátis Expirado / Assinatura Pendente'
                            : isEn
                              ? 'Unable to Sign In'
                              : 'Falha ao entrar'}
                        </p>
                        <p className="mt-0.5 leading-relaxed">{loginError}</p>
                      </div>
                    </div>

                    {expiredAccount && (
                      <button
                        type="button"
                        onClick={() => setViewMode('payment')}
                        className="w-full py-2.5 px-3 rounded-lg bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-cyan-300" />
                        <span>
                          {isEn
                            ? 'Go to Payment & Reactivate Access'
                            : 'Ir para Pagamento e Liberar Acesso'}
                        </span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <span>{isEn ? 'Sign In' : 'Entrar no UltrAI Med'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick Test Helpers (Prototype without Backend) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                    {isEn
                      ? 'Quick test accounts (local prototype):'
                      : 'Atalhos de teste (protótipo sem backend):'}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillTestAccount('trial')}
                      className="px-2.5 py-2 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {isEn ? '3-Day Active Trial' : 'Conta 3d Grátis'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillTestAccount('expired')}
                      className="px-2.5 py-2 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 transition-colors"
                    >
                      {isEn ? 'Expired Trial (Paywall)' : 'Conta Expirada (Erro)'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* VIEW 2: REGISTER (3 DAYS FREE) */}
            {viewMode === 'register' && (
              <form onSubmit={handleRegisterSubmit} className="p-6 space-y-3.5">
                <div className="p-3 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 flex items-center gap-2.5 text-xs text-teal-900 dark:text-cyan-200">
                  <Sparkles className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0" />
                  <span>
                    {isEn
                      ? 'Enjoy 3 full days free. Your name & license automatically sign your reports.'
                      : 'Ganhe 3 dias grátis completos. Seu nome e CRM assinam automaticamente seus laudos.'}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Full Name' : 'Nome Completo do(a) Médico(a)'}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={isEn ? 'Dr. Sarah Jenkins' : 'Dra. Ana Paula Souza'}
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Medical License / ID' : 'CRM / Registro Profissional'}
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regCrm}
                      onChange={(e) => setRegCrm(e.target.value)}
                      placeholder={isEn ? 'MD / License 123456' : 'CRM/SP 123456'}
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Email' : 'E-mail'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      placeholder="medico@clinica.com"
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {isEn ? 'Password (min. 6 chars)' : 'Senha (mín. 6 caracteres)'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      placeholder="••••••"
                      className="w-full text-sm pl-9 pr-10 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword((prev) => !prev)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showRegPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {regError && (
                  <div
                    role="alert"
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-300"
                  >
                    {regError}
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-cyan-300" />
                  <span>{isEn ? 'Start 3-Day Free Trial' : 'Começar 3 Dias Grátis'}</span>
                </button>
              </form>
            )}

            {/* VIEW 3: PAYMENT / RENEWAL */}
            {viewMode === 'payment' && (
              <div className="p-6 space-y-4">
                {expiredAccount && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-0.5">
                    <span className="text-[11px] uppercase font-bold text-teal-700 dark:text-cyan-400 block">
                      {isEn ? 'Selected Account' : 'Conta Selecionada'}
                    </span>
                    <p className="font-bold text-slate-900 dark:text-slate-100">
                      {expiredAccount.name} ({expiredAccount.crm})
                    </p>
                    <p className="text-slate-500 dark:text-slate-400">{expiredAccount.email}</p>
                  </div>
                )}

                {/* Plan cards */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {isEn ? 'Choose Your Plan' : 'Escolha seu Plano'}
                  </label>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedPlan === 'monthly'
                        ? 'border-teal-700 dark:border-cyan-500 bg-teal-50/70 dark:bg-teal-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                        {isEn ? 'Monthly Plan' : 'Plano Mensal'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isEn ? 'Cancel anytime' : 'Renovação mensal · Cancele quando quiser'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-teal-800 dark:text-cyan-300">
                        R$ 89,90
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        /{isEn ? 'mo' : 'mês'}
                      </span>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedPlan('annual')}
                    className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between ${
                      selectedPlan === 'annual'
                        ? 'border-teal-700 dark:border-cyan-500 bg-teal-50/70 dark:bg-teal-950/40'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {isEn ? 'Annual Plan' : 'Plano Anual'}
                        </p>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          -15%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {isEn ? 'Billed annually' : 'Melhor custo-benefício'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-teal-800 dark:text-cyan-300">
                        R$ 75,90
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        /{isEn ? 'mo' : 'mês'}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Payment method preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {isEn ? 'Payment Method' : 'Forma de Pagamento'}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === 'card'
                          ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{isEn ? 'Credit Card' : 'Cartão'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('pix')}
                      className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        paymentMethod === 'pix'
                          ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-600'
                          : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      <span>PIX</span>
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-[11px] text-slate-600 dark:text-slate-400 flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 dark:text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    {isEn
                      ? 'Prototype checkout (no backend): clicking below simulates instant payment confirmation and unlocks access.'
                      : 'Checkout simulado (sem backend): ao confirmar abaixo, o pagamento é simulado na hora e o acesso é liberado.'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSimulatedPayment}
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>
                    {isEn
                      ? 'Confirm Payment (Simulated) & Unlock'
                      : 'Confirmar Pagamento (Simulado) e Liberar'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (onCancelUpgrade && existingSession) {
                      onCancelUpgrade();
                    } else {
                      setViewMode('login');
                    }
                  }}
                  className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {existingSession && onCancelUpgrade
                      ? isEn
                        ? 'Back to Workstation'
                        : 'Voltar para o App'
                      : isEn
                        ? 'Back to Sign In'
                        : 'Voltar para o Login'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
