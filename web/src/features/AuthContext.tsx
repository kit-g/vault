import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { UserOut } from "../api";

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  user: UserOut | null;
  login: (token: string, user: UserOut) => void;
  logout: () => void;
  setUser: (user: UserOut | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('access_token'));
  const [user, setUser] = useState<UserOut | null>(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This effect just handles the initial loading state
    setIsLoading(false);
  }, []);

  const login = (newToken: string, user: UserOut) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(newToken);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  };

  const value = { token, isLoading, login, logout, user, setUser };

  return (
    <AuthContext.Provider value={ value }>
      { !isLoading && children }
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
