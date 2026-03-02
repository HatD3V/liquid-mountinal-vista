import { useState } from "react";
import { motion } from "framer-motion";
import { doc, getDoc } from "firebase/firestore";
import { signInWithEmailAndPassword, verifyBeforeUpdateEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";

const supportUrl = "https://tally.so/r/9qdRyQ";

const Recovery = () => {
  const [uid, setUid] = useState("");
  const [hex, setHex] = useState("");
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phase, setPhase] = useState<"verify" | "reset">("verify");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const normalizedUid = uid.trim();
      const normalizedHex = hex.trim();
      const normalizedEmail = email.trim().toLowerCase();

      const snap = await getDoc(doc(db, "user", normalizedUid));

      if (!snap.exists()) {
        setError("No matching recovery record found. Please verify your details or contact support.");
        setLoading(false);
        return;
      }

      const data = snap.data() as Record<string, unknown>;
      const storedEmail = String((data.email || data.currentEmail || "") as string).toLowerCase();
      const storedUid = String((data.uid || data.userUID || snap.id) as string);
      const storedHex = String((data.userhex || data.hexId || data.hex || "") as string);

      const emailMatch = storedEmail === normalizedEmail;
      const uidMatch = storedUid === normalizedUid;
      const hexMatch = storedHex === normalizedHex;

      if (emailMatch && uidMatch && hexMatch) {
        setPhase("reset");
        setMessage("Identity confirmed. Enter account password and your new email address.");
      } else if (emailMatch && (!uidMatch || !hexMatch)) {
        setError("We found that email, but UID and/or HEX did not match. Please use the support form.");
      } else {
        setError("Recovery details do not fully match. Please check your values or contact support.");
      }
    } catch {
      setError("Recovery check failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedNewEmail = newEmail.trim().toLowerCase();

      const cred = await signInWithEmailAndPassword(auth, normalizedEmail, password);
      await verifyBeforeUpdateEmail(cred.user, normalizedNewEmail);

      setMessage("Email change started. A verification link was sent to your new email.");
      setPassword("");
      setNewEmail("");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string };
      if (firebaseError?.code === "auth/wrong-password" || firebaseError?.code === "auth/invalid-credential") {
        setError("Password is incorrect.");
      } else if (firebaseError?.code === "auth/requires-recent-login") {
        setError("For security, sign in again and retry this recovery step.");
      } else {
        setError("Unable to change email from recovery flow.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="container mx-auto max-w-2xl py-16">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass-panel-strong p-8"
        >
          <h1 className="font-display text-3xl font-bold text-foreground mb-2">Account Recovery</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Verify your UID, Mountinal-HEX, and current account email to start secure recovery.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
              {error} {error.includes("support form") && (
                <a href={supportUrl} target="_blank" rel="noreferrer" className="underline font-medium">Open support form</a>
              )}
            </div>
          )}

          {message && (
            <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">{message}</div>
          )}

          {phase === "verify" ? (
            <form onSubmit={handleVerifyIdentity} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">User UID</label>
                <input
                  required
                  value={uid}
                  onChange={(e) => setUid(e.target.value)}
                  className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter UID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Mountinal-HEX</label>
                <input
                  required
                  value={hex}
                  onChange={(e) => setHex(e.target.value)}
                  className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter HEX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Current Account Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="you@example.com"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full glass-button-primary text-base disabled:opacity-50">
                {loading ? "Checking..." : "Verify Recovery Details"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleChangeEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Account Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">New Email Address</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="new-email@example.com"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full glass-button-primary text-base disabled:opacity-50">
                {loading ? "Updating..." : "Change Email"}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Recovery;
