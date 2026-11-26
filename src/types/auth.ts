export type SubscriptionStatus = 'trial' | 'active' | 'expired';

export type SubscriptionPlan = 'monthly' | 'annual';

export interface PhysicianAccount {
  id: string;
  name: string;
  crm: string;
  email: string;
  password: string; // Armazenado localmente apenas na fase protótipo sem backend
  trialEndsAt: string;
  subscriptionStatus: SubscriptionStatus;
  subscriptionEndsAt?: string;
  plan?: SubscriptionPlan;
}

export interface AuthSession {
  accountId: string;
  name: string;
  crm: string;
  email: string;
  subscriptionStatus: SubscriptionStatus;
  daysRemaining: number;
}

export interface ExpiredAccountPreview {
  id: string;
  name: string;
  crm: string;
  email: string;
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
