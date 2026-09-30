import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { signInWithEmailAndPassword, signOut as fbSignOut, onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { firebaseAuth } from "../lib/firebase";
import type { User } from "../lib/types";


interface AuthContextType {
  user: User | null;
  token: string | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER: User = {
  id: 1,
  username: "admin@pragyan.internal",
  email: "admin@pragyan.internal",
  role: "ADMIN",
  is_active: true,
  created_at: new Date().toISOString()
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem("pragyan_jwt"));
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(DEMO_USER);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          localStorage.setItem("pragyan_jwt", idToken);
          setToken(idToken);

          setUser({
            id: 101,
            username: fbUser.email?.split("@")[0] || "analyst",
            email: fbUser.email || "user@pragyan.internal",
            role: fbUser.email?.includes("admin") ? "ADMIN" : "ANALYST",
            is_active: true,
            created_at: new Date().toISOString()
          });
        } catch {
          /* ignore */
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailStr: string, passwordStr: string) => {
    // If input is short username without @, append domain for Firebase Email Auth compatibility
    const formattedEmail = emailStr.includes("@") ? emailStr : `${emailStr}@pragyan.internal`;
    
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, formattedEmail, passwordStr);
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem("pragyan_jwt", idToken);
      setToken(idToken);
      setUser({
        id: 101,
        username: userCredential.user.email?.split("@")[0] || emailStr,
        email: userCredential.user.email || formattedEmail,
        role: emailStr.includes("admin") ? "ADMIN" : "ANALYST",
        is_active: true,
        created_at: new Date().toISOString()
      });
    } catch (err: any) {
      // Fallback for demo lab environment (admin / admin123)
      if ((emailStr === "admin" || emailStr === "admin@pragyan.internal") && passwordStr === "admin123") {
        const mockToken = "mock_firebase_jwt_token_admin";
        localStorage.setItem("pragyan_jwt", mockToken);
        setToken(mockToken);
        setUser(DEMO_USER);
        return;
      }
      throw new Error(err.message || "Firebase Authentication failed");
    }
  };

  const logout = async () => {
    try {
      await fbSignOut(firebaseAuth);
    } catch {
      /* ignore */
    }
    localStorage.removeItem("pragyan_jwt");
    setToken(null);
    setFirebaseUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        firebaseUser,
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
