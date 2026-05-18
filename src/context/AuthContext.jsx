import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, profileService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [isOnline,    setIsOnline]    = useState(true);

  useEffect(() => {
    const restaurarSesion = async () => {
      const usuarioGuardado = authService.getCurrentUser();

      if (usuarioGuardado) {
        setCurrentUser(usuarioGuardado);
        try {
          const usuarioActualizado = await profileService.getMe();
          setCurrentUser(usuarioActualizado);
          localStorage.setItem('mg_user', JSON.stringify(usuarioActualizado));
        } catch {}
      }

      setLoading(false);
    };

    restaurarSesion();

    const marcarEnLinea   = () => setIsOnline(true);
    const marcarSinLinea  = () => setIsOnline(false);

    window.addEventListener('online',  marcarEnLinea);
    window.addEventListener('offline', marcarSinLinea);

    return () => {
      window.removeEventListener('online',  marcarEnLinea);
      window.removeEventListener('offline', marcarSinLinea);
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
    const actualizado = await profileService.update(payload);
    setCurrentUser(actualizado);
    localStorage.setItem('mg_user', JSON.stringify(actualizado));
    return actualizado;
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isOnline,
      isAdmin:      currentUser?.rol === 'admin',
      isSupervisor: currentUser?.rol === 'supervisor',
      isTecnico:    currentUser?.rol === 'tecnico',
      login,
      logout,
      updateProfile,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);