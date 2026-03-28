import fs from 'fs';
import path from 'path';

const TOKEN_FILE =
  process.env.NODE_ENV === 'development'
    ? path.join(process.cwd(), 'meta-token.json')
    : '/tmp/meta-token.json';

export interface TokenStore {
  token: string;
  expiresAt: number; // Unix timestamp
  refreshedAt: number; // Unix timestamp
}

export interface TokenStatus {
  valid: boolean;
  expiresAt: number | null;
  daysUntilExpiry: number | null;
  needsRefresh: boolean; // < 7 days
  isExpired: boolean;
  source: 'file' | 'env' | 'unknown';
}

function readTokenStore(): TokenStore | null {
  try {
    if (fs.existsSync(TOKEN_FILE)) {
      const raw = fs.readFileSync(TOKEN_FILE, 'utf8');
      return JSON.parse(raw) as TokenStore;
    }
  } catch {
    // ignore read errors
  }
  return null;
}

export function writeTokenStore(store: TokenStore): void {
  try {
    fs.writeFileSync(TOKEN_FILE, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('[meta-token] Failed to write token store:', err);
  }
}

export function getActiveToken(): string {
  const store = readTokenStore();
  if (store?.token) return store.token;
  return process.env.META_ACCESS_TOKEN || '';
}

export function getTokenSource(): 'file' | 'env' | 'unknown' {
  const store = readTokenStore();
  if (store?.token) return 'file';
  if (process.env.META_ACCESS_TOKEN) return 'env';
  return 'unknown';
}

export async function checkTokenStatus(): Promise<TokenStatus> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const token = getActiveToken();
  const source = getTokenSource();

  if (!token) {
    return { valid: false, expiresAt: null, daysUntilExpiry: 0, needsRefresh: true, isExpired: true, source };
  }

  // If we have stored expiry from a previous refresh, use it when credentials are missing
  if (!appId || !appSecret) {
    const store = readTokenStore();
    if (store?.expiresAt) {
      const now = Math.floor(Date.now() / 1000);
      const daysUntilExpiry = Math.floor((store.expiresAt - now) / 86400);
      return {
        valid: daysUntilExpiry > 0,
        expiresAt: store.expiresAt,
        daysUntilExpiry,
        needsRefresh: daysUntilExpiry < 7,
        isExpired: daysUntilExpiry <= 0,
        source,
      };
    }
    return { valid: true, expiresAt: null, daysUntilExpiry: null, needsRefresh: false, isExpired: false, source };
  }

  const debugUrl =
    `https://graph.facebook.com/debug_token` +
    `?input_token=${token}&access_token=${appId}|${appSecret}`;

  const res = await fetch(debugUrl);
  const json = await res.json();
  const info = json?.data;

  if (!info?.is_valid) {
    return { valid: false, expiresAt: null, daysUntilExpiry: 0, needsRefresh: true, isExpired: true, source };
  }

  const expiresAt: number | null = info.expires_at || null;
  const now = Math.floor(Date.now() / 1000);
  const daysUntilExpiry = expiresAt ? Math.floor((expiresAt - now) / 86400) : null;

  return {
    valid: true,
    expiresAt,
    daysUntilExpiry,
    needsRefresh: daysUntilExpiry !== null && daysUntilExpiry < 7,
    isExpired: expiresAt ? expiresAt < now : false,
    source,
  };
}

export async function refreshAccessToken(): Promise<{
  newToken: string;
  expiresIn: number;
  expiresAt: number;
}> {
  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const currentToken = getActiveToken();

  if (!appId || !appSecret) {
    throw new Error('META_APP_ID și META_APP_SECRET trebuie setate în .env.local pentru a reînnoi tokenul.');
  }

  if (!currentToken) {
    throw new Error('META_ACCESS_TOKEN nu este setat.');
  }

  const url =
    `https://graph.facebook.com/v21.0/oauth/access_token` +
    `?grant_type=fb_exchange_token` +
    `&client_id=${appId}` +
    `&client_secret=${appSecret}` +
    `&fb_exchange_token=${currentToken}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Meta Token Refresh: ${data.error.message}`);
  }

  const newToken: string = data.access_token;
  const expiresIn: number = data.expires_in ?? 5183944; // ~60 zile default
  const expiresAt = Math.floor(Date.now() / 1000) + expiresIn;

  writeTokenStore({ token: newToken, expiresAt, refreshedAt: Math.floor(Date.now() / 1000) });

  return { newToken, expiresIn, expiresAt };
}
