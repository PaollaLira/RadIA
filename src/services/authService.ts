import {
  AuthSession,
  LoginResult,
  PhysicianAccount,
  RegisterResult,
  SubscriptionPlan,
  SubscriptionStatus,
} from '../types/auth';
import { AppLanguage } from '../i18n/translations';

const AUTH_STORE_KEY = 'ultrai_med_auth_store_v1';
const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_DAYS = 3;

interface AuthStoreData {
  accounts: PhysicianAccount[];
  activeAccountId: string | null;
}

function buildInitialAccounts(): PhysicianAccount[] {
  const now = Date.now();
  return [
    {
      id: 'doc-trial-demo',
      name: 'Dra. Mariana Albuquerque',
      crm: 'CRM/SP 148920',
      email: 'dra.demo@ultraimed.com',
      password: '123456',
      trialStartedAt: new Date(now).toISOString(),
      trialEndsAt: new Date(now + TRIAL_DAYS * DAY_MS).toISOString(),
      subscriptionStatus: 'trial',
      createdAt: new Date(now).toISOString(),
    },
    {
      id: 'doc-expired-demo',
      name: 'Dr. Eduardo Nogueira',
      crm: 'CRM/RJ 529104',
      email: 'expirado@ultraimed.com',
      password: '123456',
      trialStartedAt: new Date(now - 5 * DAY_MS).toISOString(),
      trialEndsAt: new Date(now - 2 * DAY_MS).toISOString(),
      subscriptionStatus: 'expired',
      createdAt: new Date(now - 5 * DAY_MS).toISOString(),
    },
  ];
}

class AuthService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private getStore(): AuthStoreData {
    if (!this.isBrowser()) {
      return { accounts: buildInitialAccounts(), activeAccountId: null };
    }

    try {
      const raw = localStorage.getItem(AUTH_STORE_KEY);
      if (!raw) {
        const seeded: AuthStoreData = {
          accounts: buildInitialAccounts(),
          activeAccountId: null,
        };
        this.saveStore(seeded);
        return seeded;
      }
      const parsed = JSON.parse(raw) as AuthStoreData;
      if (!Array.isArray(parsed.accounts) || parsed.accounts.length === 0) {
        const seeded: AuthStoreData = {
          accounts: buildInitialAccounts(),
          activeAccountId: null,
        };
        this.saveStore(seeded);
        return seeded;
      }
      return parsed;
    } catch {
      const seeded: AuthStoreData = {
        accounts: buildInitialAccounts(),
        activeAccountId: null,
      };
      this.saveStore(seeded);
      return seeded;
    }
  }

  private saveStore(store: AuthStoreData): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(AUTH_STORE_KEY, JSON.stringify(store));
    } catch (err) {
      console.error('Erro ao salvar estado de autenticação:', err);
    }
  }

  private evaluateAccountStatus(account: PhysicianAccount): {
    status: SubscriptionStatus;
    daysRemaining: number;
  } {
    const now = Date.now();

    if (account.subscriptionStatus === 'active' && account.subscriptionEndsAt) {
      const endMs = new Date(account.subscriptionEndsAt).getTime();
      if (endMs > now) {
        const days = Math.max(1, Math.ceil((endMs - now) / DAY_MS));
        return { status: 'active', daysRemaining: days };
      }
      return { status: 'expired', daysRemaining: 0 };
    }

    if (account.subscriptionStatus === 'trial') {
      const trialEndMs = new Date(account.trialEndsAt).getTime();
      if (trialEndMs > now) {
        const days = Math.max(1, Math.ceil((trialEndMs - now) / DAY_MS));
        return { status: 'trial', daysRemaining: days };
      }
      return { status: 'expired', daysRemaining: 0 };
    }

    return { status: 'expired', daysRemaining: 0 };
  }

  private toSession(account: PhysicianAccount, status: SubscriptionStatus, daysRemaining: number): AuthSession {
    return {
      accountId: account.id,
      name: account.name,
      crm: account.crm,
      email: account.email,
      subscriptionStatus: status,
      trialEndsAt: account.trialEndsAt,
      subscriptionEndsAt: account.subscriptionEndsAt,
      plan: account.plan,
      daysRemaining,
    };
  }

  public getSession(): AuthSession | null {
    const store = this.getStore();
    if (!store.activeAccountId) return null;

    const account = store.accounts.find((a) => a.id === store.activeAccountId);
    if (!account) return null;

    const { status, daysRemaining } = this.evaluateAccountStatus(account);
    if (status === 'expired') {
      account.subscriptionStatus = 'expired';
      store.activeAccountId = null;
      this.saveStore(store);
      return null;
    }

    return this.toSession(account, status, daysRemaining);
  }

  public login(email: string, password: string, lang: AppLanguage = 'pt'): LoginResult {
    const isEn = lang === 'en';
    const normalizedEmail = email.trim().toLowerCase();
    const store = this.getStore();

    const account = store.accounts.find(
      (a) => a.email.trim().toLowerCase() === normalizedEmail
    );

    if (!account || account.password !== password) {
      return {
        ok: false,
        reason: 'INVALID_CREDENTIALS',
        message: isEn
          ? 'Invalid email or password. Please verify your credentials.'
          : 'E-mail ou senha incorretos. Verifique seus dados de acesso.',
      };
    }

    const { status, daysRemaining } = this.evaluateAccountStatus(account);
    if (status === 'expired') {
      account.subscriptionStatus = 'expired';
      store.activeAccountId = null;
      this.saveStore(store);
      return {
        ok: false,
        reason: 'SUBSCRIPTION_EXPIRED',
        account: {
          id: account.id,
          name: account.name,
          crm: account.crm,
          email: account.email,
          trialEndsAt: account.trialEndsAt,
        },
        message: isEn
          ? 'Your 3-day free trial has expired. Please activate your subscription to continue accessing UltrAI Med.'
          : 'Seu período de uso grátis de 3 dias expirou. Ative sua assinatura mensal para continuar acessando o UltrAI Med.',
      };
    }

    store.activeAccountId = account.id;
    this.saveStore(store);
    return {
      ok: true,
      session: this.toSession(account, status, daysRemaining),
    };
  }

  public register(
    params: {
      name: string;
      crm: string;
      email: string;
      password: string;
    },
    lang: AppLanguage = 'pt'
  ): RegisterResult {
    const isEn = lang === 'en';
    const name = params.name.trim();
    const crm = params.crm.trim();
    const email = params.email.trim().toLowerCase();
    const password = params.password;

    if (!name || !crm || !email) {
      return {
        ok: false,
        message: isEn
          ? 'Please fill in your full name, medical license (CRM), and email.'
          : 'Preencha seu nome completo, registro profissional (CRM) e e-mail.',
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        ok: false,
        message: isEn ? 'Please enter a valid email address.' : 'Informe um e-mail válido.',
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        message: isEn
          ? 'Password must be at least 6 characters long.'
          : 'A senha deve ter pelo menos 6 caracteres.',
      };
    }

    const store = this.getStore();
    const alreadyExists = store.accounts.some(
      (a) => a.email.trim().toLowerCase() === email
    );

    if (alreadyExists) {
      return {
        ok: false,
        message: isEn
          ? 'An account with this email already exists. Please sign in instead.'
          : 'Já existe uma conta cadastrada com este e-mail. Faça login na aba Entrar.',
      };
    }

    const now = Date.now();
    const newAccount: PhysicianAccount = {
      id: `doc-${now}`,
      name,
      crm,
      email,
      password,
      trialStartedAt: new Date(now).toISOString(),
      trialEndsAt: new Date(now + TRIAL_DAYS * DAY_MS).toISOString(),
      subscriptionStatus: 'trial',
      createdAt: new Date(now).toISOString(),
    };

    store.accounts.unshift(newAccount);
    store.activeAccountId = newAccount.id;
    this.saveStore(store);

    return {
      ok: true,
      session: this.toSession(newAccount, 'trial', TRIAL_DAYS),
    };
  }

  public activateSubscription(accountId: string, plan: SubscriptionPlan): AuthSession | null {
    const store = this.getStore();
    const account = store.accounts.find((a) => a.id === accountId);
    if (!account) return null;

    const now = Date.now();
    const durationDays = plan === 'annual' ? 365 : 30;
    account.subscriptionStatus = 'active';
    account.plan = plan;
    account.subscriptionEndsAt = new Date(now + durationDays * DAY_MS).toISOString();

    store.activeAccountId = account.id;
    this.saveStore(store);

    return this.toSession(account, 'active', durationDays);
  }

  public simulateExpireActiveTrial(): void {
    const store = this.getStore();
    if (!store.activeAccountId) return;
    const account = store.accounts.find((a) => a.id === store.activeAccountId);
    if (!account) return;
    const now = Date.now();
    account.subscriptionStatus = 'expired';
    account.trialEndsAt = new Date(now - DAY_MS).toISOString();
    account.subscriptionEndsAt = undefined;
    store.activeAccountId = null;
    this.saveStore(store);
  }

  public logout(): void {
    const store = this.getStore();
    store.activeAccountId = null;
    this.saveStore(store);
  }
}

export const authService = new AuthService();
