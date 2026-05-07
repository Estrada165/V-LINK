import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/api';
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [isOnline,    setIsOnline]    = useState(true);

  // Al montar: restaurar sesión guardada en localStorage
  useEffect(() => {
    const init = async () => {
      const savedUser = authService.getCurrentUser();
      if (savedUser) {
        setCurrentUser(savedUser);
        // Intentar refrescar desde la BD
        try {
          const fresh = await profileService.getMe();
          setCurrentUser(fresh);
          localStorage.setItem('mg_user', JSON.stringify(fresh));
        } catch {
          // Si falla (offline o token expirado), usar datos guardados
        }
      }
      setLoading(false);
    };
    init();

    // Detectar conectividad del navegador
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const login = async (correo_electronico, password) => {
    const { user } = await authService.login(correo_electronico, password);
    setCurrentUser(user);
    return user;
  };

  const logout = () => {
    authService.logout();
    setCurrentUser(null);
  };

  const updateProfile = async (payload) => {
    const updated = await profileService.update(payload);
    setCurrentUser(updated);
    localStorage.setItem('mg_user', JSON.stringify(updated));
    return updated;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isOnline,
      isAdmin: currentUser?.rol === 'admin',
      login,
      logout,
      updateProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);