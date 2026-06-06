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

// Helper genérico: agrega el token, parsea JSON y lanza errores claros.
async function request(path, { method = 'GET', body, form } = {}) {
  const token = getToken();
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) {
    headers['Content-Type'] = 'application/x-www-form-urlencoded';
    payload = new URLSearchParams(form);
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`${API_URL}${path}`, { method, headers, body: payload });
  if (res.status === 401) throw new Error('NO_AUTH');
  if (!res.ok) {
    let detail = `Error ${res.status}`;
    try {
      const j = await res.json();
      if (j.detail) detail = typeof j.detail === 'string' ? j.detail : JSON.stringify(j.detail);
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}

// ---- Auth ----
export async function login(email, password) {
  const data = await request('/auth/login', { method: 'POST', form: { username: email, password } });
  setToken(data.access_token);
  return data;
}
export const getMe = () => request('/auth/me');

// ---- Actas (sync) ----
export const upsertActa = (payload) => request('/actas', { method: 'POST', body: payload });

// ---- Usuarios ----
export const listUsuarios = () => request('/usuarios');
export const createUsuario = (data) => request('/usuarios', { method: 'POST', body: data });
export const updateUsuario = (id, data) => request(`/usuarios/${id}`, { method: 'PATCH', body: data });

// ---- Casos ----
export const listCasos = (estado) => request(`/casos${estado ? `?estado=${encodeURIComponent(estado)}` : ''}`);
export const createCaso = (data) => request('/casos', { method: 'POST', body: data });
export const updateCaso = (id, data) => request(`/casos/${id}`, { method: 'PATCH', body: data });

// ---- Visitas ----
export const listVisitas = () => request('/visitas');
export const createVisita = (data) => request('/visitas', { method: 'POST', body: data });
export const updateVisita = (id, data) => request(`/visitas/${id}`, { method: 'PATCH', body: data });
export const deleteVisita = (id) => request(`/visitas/${id}`, { method: 'DELETE' });
