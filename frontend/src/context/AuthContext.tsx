import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  signOut as fbSignOut, 
  onAuthStateChanged, 
  User as FirebaseUser 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { firebaseAuth, firestore } from "../lib/firebase";
import type { User } from "../lib/types";

export interface OnboardingData {
  fullName: string;
  email: string;
  organization: string;
  socRole: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (onboardingData: OnboardingData) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo credentials constant rule
export const DEMO_CREDENTIALS = {
  EMAIL: "admin@pragyan.internal",
  SHORT_USER: "admin",
  PASSWORD: "admin123"
};

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
  const [isDemoUser, setIsDemoUser] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const idToken = await fbUser.getIdToken();
          localStorage.setItem("pragyan_jwt", idToken);
          setToken(idToken);
          setIsDemoUser(false);

          // Fetch real profile data from Firestore
          const userDocRef = doc(firestore, "users", fbUser.uid);
          const snap = await getDoc(userDocRef);

          if (snap.exists()) {
            const data = snap.data();
            setUser({
              id: fbUser.uid,
              username: data.fullName || fbUser.email?.split("@")[0] || "analyst",
              email: fbUser.email || "user@pragyan.internal",
              role: data.role || "ANALYST",
              is_active: true,
              created_at: data.createdAt || new Date().toISOString()
            });
          } else {
            setUser({
              id: fbUser.uid,
              username: fbUser.email?.split("@")[0] || "analyst",
              email: fbUser.email || "user@pragyan.internal",
              role: fbUser.email?.includes("admin") ? "ADMIN" : "ANALYST",
              is_active: true,
              created_at: new Date().toISOString()
            });
          }
        } catch {
          /* ignore fallback */
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (emailStr: string, passwordStr: string) => {
    const formattedEmail = emailStr.includes("@") ? emailStr : `${emailStr}@pragyan.internal`;
    
    // DEMO SPECIFIC CREDENTIALS RULE: Only admin@pragyan.internal / admin123 runs demo mode
    if ((emailStr === "admin" || emailStr === "admin@pragyan.internal") && passwordStr === "admin123") {
      const mockToken = "mock_firebase_jwt_token_admin";
      localStorage.setItem("pragyan_jwt", mockToken);
      setToken(mockToken);
      setUser(DEMO_USER);
      setIsDemoUser(true);
      return;
    }

    // ALL OTHER CREDENTIALS: Live real-time Firebase Auth & Firestore data
    try {
      const userCredential = await signInWithEmailAndPassword(firebaseAuth, formattedEmail, passwordStr);
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem("pragyan_jwt", idToken);
      setToken(idToken);
      setIsDemoUser(false);

      // Read user profile from Firestore
      const userDocRef = doc(firestore, "users", userCredential.user.uid);
      const snap = await getDoc(userDocRef);
      if (snap.exists()) {
        const data = snap.data();
        setUser({
          id: userCredential.user.uid,
          username: data.fullName || userCredential.user.email?.split("@")[0] || emailStr,
          email: userCredential.user.email || formattedEmail,
          role: data.role || "ANALYST",
          is_active: true,
          created_at: data.createdAt || new Date().toISOString()
        });
      } else {
        setUser({
          id: userCredential.user.uid,
          username: userCredential.user.email?.split("@")[0] || emailStr,
          email: userCredential.user.email || formattedEmail,
          role: emailStr.includes("admin") ? "ADMIN" : "ANALYST",
          is_active: true,
          created_at: new Date().toISOString()
        });
      }
    } catch (err: any) {
      throw new Error(err.message || "Firebase Authentication failed");
    }
  };

  const signup = async (onboardingData: OnboardingData) => {
    const formattedEmail = onboardingData.email.includes("@") 
      ? onboardingData.email 
      : `${onboardingData.email}@pragyan.internal`;

    try {
      // 1. Create Real Firebase Auth User
      const userCredential = await createUserWithEmailAndPassword(
        firebaseAuth, 
        formattedEmail, 
        onboardingData.password
      );

      const uid = userCredential.user.uid;
      const idToken = await userCredential.user.getIdToken();
      localStorage.setItem("pragyan_jwt", idToken);
      setToken(idToken);
      setIsDemoUser(false);

      // 2. Complete Onboarding: Save complete user data into Firestore 'users' collection
      const profileData = {
        uid,
        fullName: onboardingData.fullName,
        email: formattedEmail,
        organization: onboardingData.organization || "Pragyan Enterprise SOC",
        socRole: onboardingData.socRole || "Security Analyst",
        role: "ANALYST",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isDemoUser: false
      };

      await setDoc(doc(firestore, "users", uid), profileData);

      setUser({
        id: uid,
        username: onboardingData.fullName || formattedEmail.split("@")[0],
        email: formattedEmail,
        role: "ANALYST",
        is_active: true,
        created_at: profileData.createdAt
      });
    } catch (err: any) {
      throw new Error(err.message || "Onboarding Account Creation failed.");
    }
  };

  const resetPassword = async (emailStr: string) => {
    const formattedEmail = emailStr.includes("@") ? emailStr : `${emailStr}@pragyan.internal`;
    try {
      await sendPasswordResetEmail(firebaseAuth, formattedEmail);
    } catch (err: any) {
      throw new Error(err.message || "Password reset request failed.");
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
    setIsDemoUser(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        firebaseUser,
        login,
        signup,
        resetPassword,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "ADMIN",
        isDemoUser
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
