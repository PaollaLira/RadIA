export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export type SubscriptionPlan = 'monthly' | 'annual';

export interface PhysicianAccount {
  id: string;
  name: string;
  crm: string;
  email: string;
  password: string; // Armazenado localmente apenas na fase protótipo sem backend
  trialStartedAt: string;
  trialEndsAt: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt?: string;
  plan?: SubscriptionPlan;
  createdAt: string;
}

export interface AuthSession {
  accountId: string;
  name: string;
  crm: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: string;
  subscriptionEndsAt?: string;
  plan?: SubscriptionPlan;
  daysRemaining: number;
}

export interface ExpiredAccountPreview {
  id: string;
  name: string;
  crm: string;
  email: string;
  trialEndsAt: string;
}

export type LoginResult =
  | { ok: true; session: AuthSession }
  | { ok: false; reason: 'INVALID_CREDENTIALS'; message: string }
  | {
      ok: false;
      reason: 'SUBSCRIPTION_EXPIRED';
      account: ExpiredAccountPreview;
      message: string;
    };

export type RegisterResult =
  | { ok: true; session: AuthSession }
  | { ok: false; message: string };
