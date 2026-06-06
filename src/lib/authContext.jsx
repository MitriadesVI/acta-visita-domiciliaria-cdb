"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { login as apiLogin, getMe, getToken, clearToken } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (getToken()) {
      getMe()
        .then(setUser)
        .catch(() => clearToken())
        .finally(() => setCargando(false));
    } else {
      setCargando(false);
    }
  }, []);

  const login = async (email, password) => {
    await apiLogin(email, password);
    const me = await getMe();
    setUser(me);
    return me;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  const esAdmin = user?.rol === 'admin';
  const esCoordinacion = user?.rol === 'admin' || user?.rol === 'coordinador';

  return (
    <AuthContext.Provider value={{ user, cargando, login, logout, esAdmin, esCoordinacion }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
