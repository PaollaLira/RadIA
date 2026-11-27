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
import { PWAInstallButton } from '../common/PWAInstallButton';

type AuthViewMode = 'login' | 'register' | 'payment';

interface AuthAndPaywallScreenProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onAuthenticated: (session: AuthSession) => void;
  initialMode?: AuthViewMode;
  existingSession?: AuthSession | null;
  initialExpiredAccount?: ExpiredAccountPreview | null;
  onCancelUpgrade?: () => void;
}

export const AuthAndPaywallScreen: React.FC<AuthAndPaywallScreenProps> = ({
  isDarkMode,
  onToggleDarkMode,
  onAuthenticated,
  initialMode = 'login',
  existingSession,
  initialExpiredAccount = null,
  onCancelUpgrade,
}) => {
  const { lang, toggleLang, t } = useLanguage();
  const tr = (pt: string, en: string, es: string) =>
    lang === 'en' ? en : lang === 'es' ? es : pt;

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
        }
      : initialExpiredAccount
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
    <div className="min-h-dvh w-full max-w-full overflow-x-clip bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Bar minimal */}
      <header className="sticky top-0 z-30 pt-[calc(0.875rem+env(safe-area-inset-top))] md:pt-[env(safe-area-inset-top)] pl-[env(safe-area-inset-left)] pr-[env(safe-area-inset-right)] border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-3 sm:px-4 min-h-14 py-2.5 md:py-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-lg overflow-hidden shadow-sm shrink-0 bg-[#09142B]">
              <img
                src="/assets/ultrai-med-icon.jfif"
                alt="UltrAI Med"
                className="w-full h-full object-cover scale-[1.12]"
              />
            </div>
            <div className="min-w-0 truncate">
              <span className="text-sm sm:text-base font-bold tracking-tight">UltrAI Med</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-2 hidden sm:inline">
                {t.brandSubtitle}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <PWAInstallButton />
            <button
              type="button"
              onClick={toggleLang}
              className="px-2.5 py-1.5 min-h-[36px] sm:min-h-0 rounded-md text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5 text-teal-700 dark:text-cyan-400" />
              <span className="font-mono uppercase">{lang}</span>
            </button>
            <button
              type="button"
              onClick={onToggleDarkMode}
              className="p-2 min-h-[36px] min-w-[36px] sm:min-h-0 sm:min-w-0 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={t.nav.toggleTheme}
            >
              {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Main Centered Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))]">
        <div className="w-full max-w-md space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
            {/* Hero Header inside card */}
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-2xl overflow-hidden shadow-md bg-[#09142B]">
                <img
                  src="/assets/ultrai-med-icon.jfif"
                  alt="UltrAI Med"
                  className="w-full h-full object-cover scale-[1.12]"
                />
              </div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {viewMode === 'payment'
                  ? tr(
                      'Assinatura UltrAI Med',
                      'Activate UltrAI Med Subscription',
                      'Suscripción UltrAI Med'
                    )
                  : viewMode === 'register'
                    ? tr(
                        'Criar Conta Médica',
                        'Create Medical Account',
                        'Crear Cuenta Médica'
                      )
                    : tr(
                        'Acessar o UltrAI Med',
                        'Sign in to UltrAI Med',
                        'Acceder a UltrAI Med'
                      )}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {viewMode === 'payment'
                  ? tr(
                      'Acesso completo a laudos com IA, tabela de medidas e copiloto clínico.',
                      'Monthly access to AI reporting, reference measurements, and clinical copilot.',
                      'Acceso completo a informes con IA, tabla de medidas y copiloto clínico.'
                    )
                  : tr(
                      'Teste completo por 3 dias grátis para novas contas médicas.',
                      '3-day free trial included for new medical accounts.',
                      'Prueba completa de 3 días gratis para nuevas cuentas médicas.'
                    )}
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
                    {tr('Entrar', 'Sign In', 'Iniciar Sesión')}
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
                    {tr('3 Dias Grátis', '3 Days Free', '3 Días Gratis')}
                  </button>
                </div>
              )}
            </div>

            {/* VIEW 1: LOGIN */}
            {viewMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('E-mail profissional', 'Email', 'Correo profesional')}
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
                    {tr('Senha', 'Password', 'Contraseña')}
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
                      aria-label={tr(
                        'Mostrar ou ocultar senha',
                        'Toggle password visibility',
                        'Mostrar u ocultar contraseña'
                      )}
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
                            ? tr(
                                'Período Grátis Expirado / Assinatura Pendente',
                                'Free Trial Expired / Subscription Required',
                                'Período de Prueba Expirado / Suscripción Requerida'
                              )
                            : tr(
                                'Falha ao entrar',
                                'Unable to Sign In',
                                'Error al iniciar sesión'
                              )}
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
                          {tr(
                            'Ir para Pagamento e Liberar Acesso',
                            'Go to Payment & Reactivate Access',
                            'Ir a Pago y Reactivar Acceso'
                          )}
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
                  <span>
                    {tr('Entrar no UltrAI Med', 'Sign In', 'Entrar en UltrAI Med')}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Quick Test Helpers (Prototype without Backend) */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 text-center">
                    {tr(
                      'Atalhos de teste (protótipo sem backend):',
                      'Quick test accounts (local prototype):',
                      'Accesos rápidos de prueba (prototipo local):'
                    )}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleFillTestAccount('trial')}
                      className="px-2.5 py-2 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                    >
                      {tr('Conta 3d Grátis', '3-Day Active Trial', 'Cuenta 3d Gratis')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillTestAccount('expired')}
                      className="px-2.5 py-2 rounded-lg text-[11px] font-medium bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/50 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 transition-colors"
                    >
                      {tr(
                        'Conta Expirada (Erro)',
                        'Expired Trial (Paywall)',
                        'Cuenta Expirada (Error)'
                      )}
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
                    {tr(
                      'Ganhe 3 dias grátis completos. Seu nome e CRM assinam automaticamente seus laudos.',
                      'Enjoy 3 full days free. Your name & license automatically sign your reports.',
                      'Disfruta de 3 días gratis completos. Tu nombre y matrícula firman automáticamente tus informes.'
                    )}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {tr(
                      'Nome Completo do(a) Médico(a)',
                      'Full Name',
                      'Nombre Completo del/de la Médico/a'
                    )}
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      placeholder={tr(
                        'Dra. Ana Paula Souza',
                        'Dr. Sarah Jenkins',
                        'Dra. Lucía Mendoza'
                      )}
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {tr(
                      'CRM / Registro Profissional',
                      'Medical License / ID',
                      'Matrícula / Colegiado Médico'
                    )}
                  </label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      value={regCrm}
                      onChange={(e) => setRegCrm(e.target.value)}
                      placeholder={tr(
                        'CRM/SP 123456',
                        'MD / License 123456',
                        'Matrícula / Col. 123456'
                      )}
                      className="w-full text-sm pl-9 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    {tr('E-mail', 'Email', 'Correo electrónico')}
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
                    {tr(
                      'Senha (mín. 6 caracteres)',
                      'Password (min. 6 chars)',
                      'Contraseña (mín. 6 caracteres)'
                    )}
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
                  <span>
                    {tr(
                      'Começar 3 Dias Grátis',
                      'Start 3-Day Free Trial',
                      'Comenzar 3 Días Gratis'
                    )}
                  </span>
                </button>
              </form>
            )}

            {/* VIEW 3: PAYMENT / RENEWAL */}
            {viewMode === 'payment' && (
              <div className="p-6 space-y-4">
                {expiredAccount && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 text-xs space-y-0.5">
                    <span className="text-[11px] uppercase font-bold text-teal-700 dark:text-cyan-400 block">
                      {tr('Conta Selecionada', 'Selected Account', 'Cuenta Seleccionada')}
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
                    {tr('Escolha seu Plano', 'Choose Your Plan', 'Elige tu Plan')}
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
                        {tr('Plano Mensal', 'Monthly Plan', 'Plan Mensual')}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tr(
                          'Renovação mensal · Cancele quando quiser',
                          'Cancel anytime',
                          'Renovación mensual · Cancela cuando quieras'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-teal-800 dark:text-cyan-300">
                        R$ 89,90
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        /{tr('mês', 'mo', 'mes')}
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
                          {tr('Plano Anual', 'Annual Plan', 'Plan Anual')}
                        </p>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                          -15%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {tr(
                          'Melhor custo-benefício',
                          'Billed annually',
                          'Mejor relación costo-beneficio'
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-bold text-teal-800 dark:text-cyan-300">
                        R$ 75,90
                      </span>
                      <span className="block text-[11px] text-slate-500 dark:text-slate-400">
                        /{tr('mês', 'mo', 'mes')}
                      </span>
                    </div>
                  </button>
                </div>

                {/* Payment method preview */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    {tr('Forma de Pagamento', 'Payment Method', 'Método de Pago')}
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
                      <span>{tr('Cartão', 'Credit Card', 'Tarjeta')}</span>
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
                    {tr(
                      'Checkout simulado (sem backend): ao confirmar abaixo, o pagamento é simulado na hora e o acesso é liberado.',
                      'Prototype checkout (no backend): clicking below simulates instant payment confirmation and unlocks access.',
                      'Pago simulado (sin backend): al confirmar abajo, se simula el pago al instante y se habilita el acceso.'
                    )}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleConfirmSimulatedPayment}
                  className="w-full py-3 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-700 dark:hover:bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md transition-colors"
                >
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>
                    {tr(
                      'Confirmar Pagamento (Simulado) e Liberar',
                      'Confirm Payment (Simulated) & Unlock',
                      'Confirmar Pago (Simulado) y Activar'
                    )}
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
                      ? tr('Voltar para o App', 'Back to Workstation', 'Volver a la Estación')
                      : tr('Voltar para o Login', 'Back to Sign In', 'Volver al Inicio de Sesión')}
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
