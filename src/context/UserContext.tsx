import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { PerfilType } from '../types/PerfilType';

interface UserContextType {
  user: PerfilType | null;
  setUser: React.Dispatch<React.SetStateAction<PerfilType | null>>;
  // ...outras propriedades e métodos relevantes
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<PerfilType | null>(null);

  // Carregar dados do usuário do localStorage na inicialização
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (e) {
        console.error('Erro ao recuperar dados do usuário do localStorage:', e);
        localStorage.removeItem('user'); // Limpar dados inválidos
      }
    }
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
