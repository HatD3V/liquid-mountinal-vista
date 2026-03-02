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
  sendEmailVerification,
  verifyBeforeUpdateEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface UserProfile {
  email: string;
  displayName: string;
  hexId: number;
  createdAt: Date;
  emailHistory?: string[];
}

interface SessionEntry {
  id?: string;
  device: string;
  ip: string;
  timestamp: Date;
  active: boolean;
}

interface RegisterResult {
  uid: string;
  hexId: number;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<RegisterResult>;
  logout: () => Promise<void>;
  updateDisplayName: (name: string) => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  changeEmail: (newEmail: string) => Promise<void>;
  sendVerification: () => Promise<void>;
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

  const saveHexIdRecord = async (
    email: string,
    hexId: number,
    options?: { currentEmail?: string; previousEmails?: string[] },
  ) => {
    const payload: Record<string, string | number> = {
      userhex: hexId,
      currentEmail: options?.currentEmail || email,
    };

    const previousEmails = options?.previousEmails?.filter(Boolean) || [];
    if (previousEmails.length > 0) {
      const latestPreviousEmail = previousEmails[previousEmails.length - 1];
      payload.lastemail = latestPreviousEmail;
      previousEmails.forEach((previousEmail, index) => {
        payload[`lastemail${index + 1}`] = previousEmail;
      });
    }

    await setDoc(doc(db, "HEX ID", email), payload, { merge: true });
  };

  const fetchProfile = async (u: User) => {
    const ref = doc(db, "users", u.uid);

    try {
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const existingProfile = snap.data() as Partial<UserProfile>;
        let hexId = existingProfile.hexId;
        const existingEmail = existingProfile.email || "";
        const currentEmail = u.email || existingEmail;
        const emailHistory = Array.isArray(existingProfile.emailHistory)
          ? [...existingProfile.emailHistory]
          : [];

        if (existingEmail && currentEmail && existingEmail !== currentEmail && emailHistory[emailHistory.length - 1] !== existingEmail) {
          emailHistory.push(existingEmail);
        }

        if (typeof hexId !== "number") {
          hexId = generateHexId();
        }

        setProfile({
          email: currentEmail,
          displayName: existingProfile.displayName || u.displayName || "",
          hexId,
          createdAt: existingProfile.createdAt || new Date(),
          emailHistory,
        });

        try {
          if (typeof existingProfile.hexId !== "number") {
            await setDoc(ref, { hexId }, { merge: true });
          }

          if (currentEmail) {
            await saveHexIdRecord(currentEmail, hexId, {
              currentEmail,
              previousEmails: emailHistory,
            });
          }

          await setDoc(
            ref,
            {
              email: currentEmail,
              emailHistory,
            },
            { merge: true },
          );
        } catch (error) {
          console.warn("Profile metadata sync skipped:", error);
        }
        return;
      }
    } catch (error) {
      console.warn("Profile read failed, using auth fallback:", error);
    }

    const newProfile: UserProfile = {
      email: u.email || "",
      displayName: u.displayName || "",
      hexId: profile?.hexId || generateHexId(),
      createdAt: new Date(),
      emailHistory: [],
    };

    setProfile(newProfile);

    try {
      await setDoc(ref, newProfile, { merge: true });

      if (u.email) {
        await saveHexIdRecord(u.email, newProfile.hexId, {
          currentEmail: u.email,
          previousEmails: [],
        });
      }
    } catch (error) {
      console.warn("Initial profile write skipped:", error);
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
      try {
        if (u) {
          await fetchProfile(u);
        } else {
          setProfile(null);
          setSessions([]);
        }
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await logSession(cred.user.uid);
  };

  const register = async (email: string, password: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const hexId = generateHexId();

    const newProfile: UserProfile = {
      email,
      displayName: "",
      hexId,
      createdAt: new Date(),
      emailHistory: [],
    };

    setProfile(newProfile);

    try {
      await setDoc(doc(db, "users", cred.user.uid), newProfile, { merge: true });
      await saveHexIdRecord(email, hexId, { currentEmail: email, previousEmails: [] });
    } catch (error) {
      console.warn("Registration profile setup skipped:", error);
    }

    await sendEmailVerification(cred.user);
    await logSession(cred.user.uid);

    return { uid: cred.user.uid, hexId };
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

  const changeEmail = async (newEmail: string) => {
    if (!user) return;
    const currentEmail = user.email || profile?.email || "";
    const existingHistory = Array.isArray(profile?.emailHistory) ? [...profile!.emailHistory!] : [];
    const updatedHistory = currentEmail && existingHistory[existingHistory.length - 1] !== currentEmail
      ? [...existingHistory, currentEmail]
      : existingHistory;

    try {
      await verifyBeforeUpdateEmail(user, newEmail);
    } catch (error: unknown) {
      const firebaseError = error as { code?: string };
      if (firebaseError?.code === "auth/requires-recent-login") {
        throw new Error("For security, please log out and sign back in before changing your email.");
      }
      throw error;
    }

    setProfile((prev) =>
      prev
        ? {
            ...prev,
            emailHistory: updatedHistory,
          }
        : prev,
    );

    try {
      await setDoc(
        doc(db, "users", user.uid),
        {
          emailHistory: updatedHistory,
          pendingEmail: newEmail,
        },
        { merge: true },
      );

      const hexIdToUse = profile?.hexId || generateHexId();
      await saveHexIdRecord(newEmail, hexIdToUse, {
        currentEmail: newEmail,
        previousEmails: updatedHistory,
      });
    } catch (error) {
      console.warn("Email change metadata sync skipped:", error);
    }
  };

  const sendVerification = async () => {
    if (!user) return;
    await sendEmailVerification(user);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, login, register, logout, updateDisplayName, changePassword, changeEmail, sendVerification, resetPassword, sessions, refreshSessions }}
    >
      {children}
    </AuthContext.Provider>
  );
};
