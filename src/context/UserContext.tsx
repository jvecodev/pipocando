import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PerfilType } from '../types/PerfilType';

interface UserContextType {
  user: PerfilType | null;
  setUser: (user: PerfilType | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PerfilType | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
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
