import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Mock credentials
const USERS = {
  admin: {
    id: 1,
    username: 'admin',
    password: '12345',
    role: 'admin',
    name: 'Admin Motoguard',
    email: 'admin@motoguard.io',
    avatar: 'AM',
  },
  usuario: {
    id: 2,
    username: 'usuario',
    password: '123456',
    role: 'user',
    name: 'Carlos Mendoza',
    email: 'carlos@motoguard.io',
    avatar: 'CM',
  },
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  const login = (username, password) => {
    const user = USERS[username];
    if (user && user.password === password) {
      setCurrentUser(user);
      return { ok: true, role: user.role };
    }
    return { ok: false, error: 'Credenciales incorrectas' };
  };

  const logout = () => setCurrentUser(null);

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAdmin: currentUser?.role === 'admin' }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);