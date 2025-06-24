import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import type { UserOut } from "../api";

interface AuthContextType {
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: UserOut) => void;
  logout: () => void;
  user: UserOut | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  // const [user, setUser] = useState<UserOut | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setIsLoading(false);
  }, []);

  const login = (newToken: string, user: UserOut) => {
    localStorage.setItem("access_token", newToken);
    localStorage.setItem("user", JSON.stringify(user));
    setToken(newToken);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    setToken(null);
  };

  const user = JSON.parse(localStorage.getItem("user") || "null") as UserOut | null;

  const value = { token, isLoading, login, logout, user };

  return (
    <AuthContext.Provider value={ value }>
      { children }
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext)!;
