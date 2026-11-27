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
const AUTH_SESSION_BACKUP_KEY = 'ultrai_med_session_backup_v1';
const AUTH_COOKIE_NAME = 'ultrai_med_session_v1';
const AUTH_IDB_NAME = 'ultrai_med_persistent_db';
const AUTH_IDB_STORE = 'auth_state';
const AUTH_IDB_RECORD_KEY = 'store_v1';
const COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60; // 30 days
const DAY_MS = 24 * 60 * 60 * 1000;
const TRIAL_DAYS = 3;

interface AuthStoreData {
  accounts: PhysicianAccount[];
  activeAccountId: string | null;
}

interface SessionSnapshot {
  accountId: string;
  name: string;
  crm: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  subscriptionEndsAt?: string;
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
      trialEndsAt: new Date(now + TRIAL_DAYS * DAY_MS).toISOString(),
      subscriptionStatus: 'trial',
    },
    {
      id: 'doc-expired-demo',
      name: 'Dr. Eduardo Nogueira',
      crm: 'CRM/RJ 529104',
      email: 'expirado@ultraimed.com',
      password: '123456',
      trialEndsAt: new Date(now - 2 * DAY_MS).toISOString(),
      subscriptionStatus: 'expired',
    },
  ];
}

function openAuthDatabase(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || typeof indexedDB === 'undefined') {
    return Promise.resolve(null);
  }
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(AUTH_IDB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(AUTH_IDB_STORE)) {
          db.createObjectStore(AUTH_IDB_STORE);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function writeAuthStoreToIndexedDB(store: AuthStoreData): Promise<void> {
  const db = await openAuthDatabase();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(AUTH_IDB_STORE, 'readwrite');
      tx.objectStore(AUTH_IDB_STORE).put(store, AUTH_IDB_RECORD_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch {
    // ignore IndexedDB failures
  } finally {
    db.close();
  }
}

async function readAuthStoreFromIndexedDB(): Promise<AuthStoreData | null> {
  const db = await openAuthDatabase();
  if (!db) return null;
  try {
    return await new Promise<AuthStoreData | null>((resolve) => {
      const tx = db.transaction(AUTH_IDB_STORE, 'readonly');
      const req = tx.objectStore(AUTH_IDB_STORE).get(AUTH_IDB_RECORD_KEY);
      req.onsuccess = () => {
        const val = req.result as AuthStoreData | undefined;
        if (val && Array.isArray(val.accounts)) {
          resolve(val);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  } finally {
    db.close();
  }
}

class AuthService {
  private lastExpiredStartupAccount: {
    id: string;
    name: string;
    crm: string;
    email: string;
  } | null = null;

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  private toSnapshot(account: PhysicianAccount): SessionSnapshot {
    return {
      accountId: account.id,
      name: account.name,
      crm: account.crm,
      email: account.email,
      subscriptionStatus: account.subscriptionStatus,
      trialEndsAt: account.trialEndsAt,
      subscriptionEndsAt: account.subscriptionEndsAt,
    };
  }

  private writeSessionCookie(snapshot: SessionSnapshot | null): void {
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    try {
      const isHttps = window.location.protocol === 'https:';
      const sameSitePart = isHttps ? '; SameSite=None; Secure' : '; SameSite=Lax';
      if (!snapshot) {
        document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; Path=/${sameSitePart}`;
        return;
      }
      const encoded = encodeURIComponent(JSON.stringify(snapshot));
      document.cookie = `${AUTH_COOKIE_NAME}=${encoded}; Max-Age=${COOKIE_MAX_AGE_SECONDS}; Path=/${sameSitePart}`;
    } catch {
      // ignore cookie write errors
    }
  }

  private readSessionCookie(): SessionSnapshot | null {
    if (typeof document === 'undefined') return null;
    try {
      const cookies = document.cookie ? document.cookie.split('; ') : [];
      const prefix = `${AUTH_COOKIE_NAME}=`;
      const rawEntry = cookies.find((c) => c.startsWith(prefix));
      if (!rawEntry) return null;
      const rawValue = rawEntry.slice(prefix.length);
      if (!rawValue) return null;
      const parsed = JSON.parse(decodeURIComponent(rawValue)) as Partial<SessionSnapshot>;
      if (!parsed.accountId || !parsed.email || !parsed.name) return null;
      return {
        accountId: parsed.accountId,
        name: parsed.name,
        crm: parsed.crm || '',
        email: parsed.email,
        subscriptionStatus: parsed.subscriptionStatus || 'trial',
        trialEndsAt: parsed.trialEndsAt || new Date(Date.now() + TRIAL_DAYS * DAY_MS).toISOString(),
        subscriptionEndsAt: parsed.subscriptionEndsAt,
      };
    } catch {
      return null;
    }
  }

  private readBackupSnapshot(): SessionSnapshot | null {
    if (!this.isBrowser()) return null;
    try {
      const raw = localStorage.getItem(AUTH_SESSION_BACKUP_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<SessionSnapshot>;
        if (parsed.accountId && parsed.email && parsed.name) {
          return {
            accountId: parsed.accountId,
            name: parsed.name,
            crm: parsed.crm || '',
            email: parsed.email,
            subscriptionStatus: parsed.subscriptionStatus || 'trial',
            trialEndsAt:
              parsed.trialEndsAt || new Date(Date.now() + TRIAL_DAYS * DAY_MS).toISOString(),
            subscriptionEndsAt: parsed.subscriptionEndsAt,
          };
        }
      }
    } catch {
      // ignore backup parse failure
    }
    return this.readSessionCookie();
  }

  private persistBackupSnapshot(snapshot: SessionSnapshot | null): void {
    this.writeSessionCookie(snapshot);
    if (!this.isBrowser()) return;
    try {
      if (snapshot) {
        localStorage.setItem(AUTH_SESSION_BACKUP_KEY, JSON.stringify(snapshot));
      } else {
        localStorage.removeItem(AUTH_SESSION_BACKUP_KEY);
      }
    } catch {
      // ignore quota error on backup key
    }
  }

  private mergeSnapshotIntoStore(store: AuthStoreData, snapshot: SessionSnapshot): AuthStoreData {
    const existing = store.accounts.find((a) => a.id === snapshot.accountId);
    if (existing) {
      existing.subscriptionStatus = snapshot.subscriptionStatus;
      existing.trialEndsAt = snapshot.trialEndsAt;
      if (snapshot.subscriptionEndsAt) {
        existing.subscriptionEndsAt = snapshot.subscriptionEndsAt;
      }
    } else {
      store.accounts.unshift({
        id: snapshot.accountId,
        name: snapshot.name,
        crm: snapshot.crm,
        email: snapshot.email,
        password: '',
        trialEndsAt: snapshot.trialEndsAt,
        subscriptionStatus: snapshot.subscriptionStatus,
        subscriptionEndsAt: snapshot.subscriptionEndsAt,
      });
    }
    store.activeAccountId = snapshot.accountId;
    return store;
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
        const backup = this.readBackupSnapshot();
        if (backup) {
          this.mergeSnapshotIntoStore(seeded, backup);
        }
        this.saveStore(seeded, { syncBackup: false });
        return seeded;
      }
      const parsed = JSON.parse(raw) as AuthStoreData;
      if (!Array.isArray(parsed.accounts) || parsed.accounts.length === 0) {
        const seeded: AuthStoreData = {
          accounts: buildInitialAccounts(),
          activeAccountId: null,
        };
        const backup = this.readBackupSnapshot();
        if (backup) {
          this.mergeSnapshotIntoStore(seeded, backup);
        }
        this.saveStore(seeded, { syncBackup: false });
        return seeded;
      }
      if (!parsed.activeAccountId) {
        const backup = this.readBackupSnapshot();
        if (backup) {
          this.mergeSnapshotIntoStore(parsed, backup);
          this.saveStore(parsed, { syncBackup: false });
        }
      }
      return parsed;
    } catch {
      const seeded: AuthStoreData = {
        accounts: buildInitialAccounts(),
        activeAccountId: null,
      };
      const backup = this.readBackupSnapshot();
      if (backup) {
        this.mergeSnapshotIntoStore(seeded, backup);
      }
      this.saveStore(seeded, { syncBackup: false });
      return seeded;
    }
  }

  private saveStore(
    store: AuthStoreData,
    options: { syncBackup?: boolean } = { syncBackup: true }
  ): void {
    const activeAccount = store.activeAccountId
      ? store.accounts.find((a) => a.id === store.activeAccountId) || null
      : null;

    if (options.syncBackup !== false) {
      this.persistBackupSnapshot(activeAccount ? this.toSnapshot(activeAccount) : null);
      void writeAuthStoreToIndexedDB(store);
    }

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
      daysRemaining,
    };
  }

  public requestDurableStorage(): void {
    if (typeof navigator !== 'undefined' && navigator.storage?.persist) {
      void navigator.storage.persist().catch(() => undefined);
    }
  }

  public getExpiredStartupAccount() {
    return this.lastExpiredStartupAccount;
  }

  public getSession(): AuthSession | null {
    this.lastExpiredStartupAccount = null;
    const store = this.getStore();
    if (!store.activeAccountId) return null;

    const account = store.accounts.find((a) => a.id === store.activeAccountId);
    if (!account) return null;

    const { status, daysRemaining } = this.evaluateAccountStatus(account);
    if (status === 'expired') {
      this.lastExpiredStartupAccount = {
        id: account.id,
        name: account.name,
        crm: account.crm,
        email: account.email,
      };
      account.subscriptionStatus = 'expired';
      store.activeAccountId = null;
      this.saveStore(store);
      return null;
    }

    // Ensure backup snapshot & cookie stay fresh across restarts
    this.persistBackupSnapshot(this.toSnapshot(account));
    return this.toSession(account, status, daysRemaining);
  }

  public async restoreSessionFromPersistentStorage(): Promise<AuthSession | null> {
    const syncSession = this.getSession();
    if (syncSession) {
      return syncSession;
    }

    const idbStore = await readAuthStoreFromIndexedDB();
    if (!idbStore || !idbStore.activeAccountId) {
      return null;
    }

    const idbAccount = idbStore.accounts.find((a) => a.id === idbStore.activeAccountId);
    if (!idbAccount) {
      return null;
    }

    const localStore = this.getStore();
    for (const acc of idbStore.accounts) {
      if (!localStore.accounts.some((existing) => existing.id === acc.id)) {
        localStore.accounts.push(acc);
      }
    }
    localStore.activeAccountId = idbAccount.id;

    const { status, daysRemaining } = this.evaluateAccountStatus(idbAccount);
    if (status === 'expired') {
      this.lastExpiredStartupAccount = {
        id: idbAccount.id,
        name: idbAccount.name,
        crm: idbAccount.crm,
        email: idbAccount.email,
      };
      idbAccount.subscriptionStatus = 'expired';
      localStore.activeAccountId = null;
      this.saveStore(localStore);
      return null;
    }

    this.saveStore(localStore);
    return this.toSession(idbAccount, status, daysRemaining);
  }

  public login(email: string, password: string, lang: AppLanguage = 'pt'): LoginResult {
    const normalizedEmail = email.trim().toLowerCase();
    const store = this.getStore();

    const account = store.accounts.find(
      (a) => a.email.trim().toLowerCase() === normalizedEmail
    );

    if (!account || account.password !== password) {
      return {
        ok: false,
        reason: 'INVALID_CREDENTIALS',
        message:
          lang === 'en'
            ? 'Invalid email or password. Please verify your credentials.'
            : lang === 'es'
            ? 'Correo electrónico o contraseña incorrectos. Verifique sus credenciales.'
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
        },
        message:
          lang === 'en'
            ? 'Your 3-day free trial has expired. Please activate your subscription to continue accessing UltrAI Med.'
            : lang === 'es'
            ? 'Su período de prueba gratuito de 3 días ha expirado. Active su suscripción mensual para seguir accediendo a UltrAI Med.'
            : 'Seu período de uso grátis de 3 dias expirou. Ative sua assinatura mensal para continuar acessando o UltrAI Med.',
      };
    }

    this.lastExpiredStartupAccount = null;
    store.activeAccountId = account.id;
    this.saveStore(store);
    this.requestDurableStorage();
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
    const name = params.name.trim();
    const crm = params.crm.trim();
    const email = params.email.trim().toLowerCase();
    const password = params.password;

    if (!name || !crm || !email) {
      return {
        ok: false,
        message:
          lang === 'en'
            ? 'Please fill in your full name, medical license (CRM), and email.'
            : lang === 'es'
            ? 'Complete su nombre completo, registro profesional y correo electrónico.'
            : 'Preencha seu nome completo, registro profissional (CRM) e e-mail.',
      };
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return {
        ok: false,
        message:
          lang === 'en'
            ? 'Please enter a valid email address.'
            : lang === 'es'
            ? 'Ingrese un correo electrónico válido.'
            : 'Informe um e-mail válido.',
      };
    }

    if (password.length < 6) {
      return {
        ok: false,
        message:
          lang === 'en'
            ? 'Password must be at least 6 characters long.'
            : lang === 'es'
            ? 'La contraseña debe tener al menos 6 caracteres.'
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
        message:
          lang === 'en'
            ? 'An account with this email already exists. Please sign in instead.'
            : lang === 'es'
            ? 'Ya existe una cuenta registrada con este correo. Inicie sesión en la pestaña Entrar.'
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
      trialEndsAt: new Date(now + TRIAL_DAYS * DAY_MS).toISOString(),
      subscriptionStatus: 'trial',
    };

    this.lastExpiredStartupAccount = null;
    store.accounts.unshift(newAccount);
    store.activeAccountId = newAccount.id;
    this.saveStore(store);
    this.requestDurableStorage();

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
    account.subscriptionEndsAt = new Date(now + durationDays * DAY_MS).toISOString();

    this.lastExpiredStartupAccount = null;
    store.activeAccountId = account.id;
    this.saveStore(store);
    this.requestDurableStorage();

    return this.toSession(account, 'active', durationDays);
  }

  public logout(): void {
    this.lastExpiredStartupAccount = null;
    const store = this.getStore();
    store.activeAccountId = null;
    this.saveStore(store);
  }
}

export const authService = new AuthService();
