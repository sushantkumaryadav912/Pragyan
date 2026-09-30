import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { User, AuthToken } from "../lib/types";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 1,
  username: "admin",
  email: "admin@pragyan.internal",
  role: "ADMIN",
  is_active: true,
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("pragyan_jwt"));
  const [user, setUser] = useState<User | null>(DEMO_USER);

  useEffect(() => {
    async function loadMe() {
      if (token) {
        try {
          const fetched = await api.getMe(token);
          setUser(fetched);
        } catch {
          // Fallback to demo admin user if server offline / demo mode
          setUser(DEMO_USER);
        }
      } else {
        setUser(DEMO_USER);
      }
    }
    loadMe();
  }, [token]);

  const login = async (u: string, p: string) => {
    try {
      const res: AuthToken = await api.login(u, p);
      localStorage.setItem("pragyan_jwt", res.access_token);
      setToken(res.access_token);
      setUser(res.user);
    } catch (err) {
      // In demo mode allow instant demo login
      if (u === "admin" && p === "admin123") {
        setUser(DEMO_USER);
        return;
      }
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("pragyan_jwt");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN"
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
