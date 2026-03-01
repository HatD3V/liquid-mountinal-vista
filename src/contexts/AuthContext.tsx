import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  updatePassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  email: string;
  displayName: string;
  hexId: number;
  createdAt: Date;
}

interface SessionEntry {
  id?: string;
  device: string;
  ip: string;
  timestamp: Date;
  active: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sessions: SessionEntry[];
  refreshSessions: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

function generateHexId(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

function getDeviceInfo(): string {
  const ua = navigator.userAgent;
  if (/Mobile/.test(ua)) return "Mobile Device";
  if (/Mac/.test(ua)) return "macOS Desktop";
  if (/Windows/.test(ua)) return "Windows Desktop";
  if (/Linux/.test(ua)) return "Linux Desktop";
  return "Unknown Device";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  const saveHexIdRecord = async (email: string, hexId: number) => {
    await setDoc(doc(db, "HEX ID", email), { userhex: hexId }, { merge: true });
  };

  const fetchProfile = async (u: User) => {
    const ref = doc(db, "users", u.uid);
    const snap = await getDoc(ref);

    if (snap.exists()) {
      const existingProfile = snap.data() as Partial<UserProfile>;
      let hexId = existingProfile.hexId;

      if (typeof hexId !== "number") {
        hexId = generateHexId();
        await setDoc(ref, { hexId }, { merge: true });
      }

      if (u.email) {
        await saveHexIdRecord(u.email, hexId);
      }

      setProfile({
        email: existingProfile.email || u.email || "",
        displayName: existingProfile.displayName || u.displayName || "",
        hexId,
        createdAt: existingProfile.createdAt || new Date(),
      });
    } else {
      const hexId = generateHexId();
      const newProfile: UserProfile = {
        email: u.email || "",
        displayName: u.displayName || "",
        hexId,
        createdAt: new Date(),
      };

      await setDoc(ref, newProfile);

      if (u.email) {
        await saveHexIdRecord(u.email, hexId);
      }

      setProfile(newProfile);
    }
  };

  const logSession = async (uid: string) => {
    try {
      await addDoc(collection(db, "users", uid, "sessions"), {
        device: getDeviceInfo(),
        ip: "N/A",
        timestamp: serverTimestamp(),
        active: true,
      });
    } catch (e) {
      console.log("Session logging skipped:", e);
    }
  };

  const refreshSessions = async () => {
    if (!user) return;
    try {
      const snap = await getDocs(collection(db, "users", user.uid, "sessions"));
      const entries: SessionEntry[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
        timestamp: d.data().timestamp?.toDate?.() || new Date(),
      })) as SessionEntry[];
      entries.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setSessions(entries);
    } catch {
      setSessions([]);
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        await fetchProfile(u);
      } else {
        setProfile(null);
        setSessions([]);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await logSession(cred.user.uid);
  };

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await logSession(cred.user.uid);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateDisplayName = async (name: string) => {
    if (!user) return;
    await updateProfile(user, { displayName: name });
    await setDoc(doc(db, "users", user.uid), { displayName: name }, { merge: true });
    setProfile((p) => (p ? { ...p, displayName: name } : p));
  };

  const changePassword = async (newPassword: string) => {
    if (!user) return;
    await updatePassword(user, newPassword);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, register, logout, updateDisplayName, changePassword, resetPassword, sessions, refreshSessions }}
    >
      {children}
    </AuthContext.Provider>
  );
};
