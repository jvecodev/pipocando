import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { PerfilTypeEnum } from '../types/PerfilType';

// Definir a interface para o usuário
export interface User {
  id?: number;
  name: string;
  email: string;
  role?: string;
  active?: boolean;
  perfil?: PerfilTypeEnum; // Added perfil property
  // Add other fields as needed
}

// Definir a interface para o contexto
export interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
}

// Criar e exportar o contexto
export const UserContext = createContext<UserContextType>({
  user: null,
  setUser: () => { },
  logout: () => { }
});

// Props para o provider
interface UserProviderProps {
  children: ReactNode;
}

// Componente Provider
export function UserProvider({ children }: UserProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Lógica para carregar usuário do localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Se você estiver usando localStorage para armazenar dados do usuário, garanta que o ID seja preservado
const getUserFromStorage = (): User | null => {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      const parsedUser = JSON.parse(storedUser);
      console.log("Usuário recuperado do localStorage:", parsedUser);
      return parsedUser;
    } catch (e) {
      console.error("Erro ao fazer parse do usuário do localStorage:", e);
      localStorage.removeItem('user');
      return null;
    }
  }
  return null;
};
