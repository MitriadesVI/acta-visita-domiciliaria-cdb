// Cliente del backend (FastAPI en Contabo). La URL se puede sobreescribir con
// NEXT_PUBLIC_API_URL; por defecto apunta al despliegue con TLS vía sslip.io.
const DEFAULT_API = 'https://api.157.173.105.139.sslip.io';

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || DEFAULT_API).replace(/\/$/, '');

const TOKEN_KEY = 'acta_token';

export const getToken = () =>
  typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
export const setToken = (t) => {
  if (typeof window !== 'undefined') localStorage.setItem(TOKEN_KEY, t);
};
export const clearToken = () => {
  if (typeof window !== 'undefined') localStorage.removeItem(TOKEN_KEY);
};

async function authFetch(path, opts = {}) {
  const token = getToken();
  return fetch(`${API_URL}${path}`, {
    ...opts,
    headers: {
      ...(opts.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
}

export async function login(email, password) {
  // El endpoint usa OAuth2PasswordRequestForm (campo "username" = email).
  const body = new URLSearchParams({ username: email, password });
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) throw new Error('Email o contraseña incorrectos');
  const data = await res.json();
  setToken(data.access_token);
  return data;
}

export async function getMe() {
  const res = await authFetch('/auth/me');
  if (!res.ok) throw new Error('Sesión inválida');
  return res.json();
}

export async function upsertActa(payload) {
  const res = await authFetch('/actas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (res.status === 401) throw new Error('NO_AUTH');
  if (!res.ok) throw new Error('Error al sincronizar el acta');
  return res.json();
}
