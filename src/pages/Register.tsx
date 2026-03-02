import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Check, Copy } from "lucide-react";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [showAccountInfoModal, setShowAccountInfoModal] = useState(false);
  const [closeCooldown, setCloseCooldown] = useState(10);
  const [newUid, setNewUid] = useState("");
  const [newHexId, setNewHexId] = useState("");
  const [copiedField, setCopiedField] = useState<"uid" | "hex" | "">("");

  useEffect(() => {
    if (!showAccountInfoModal || closeCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCloseCooldown((seconds) => {
        if (seconds <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showAccountInfoModal, closeCooldown]);

  const closeButtonLabel = useMemo(() => {
    if (closeCooldown > 0) return `Close (${closeCooldown}s)`;
    return "Close";
  }, [closeCooldown]);

  const copyValue = async (value: string, field: "uid" | "hex") => {
    await navigator.clipboard.writeText(value);
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(""), 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const registration = await register(email.trim().toLowerCase(), password);
      setNewUid(registration.uid);
      setNewHexId(String(registration.hexId));
      setCloseCooldown(10);
      setShowAccountInfoModal(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Registration failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-panel-strong w-full max-w-md p-8"
      >
        <h1 className="font-display text-3xl font-bold text-center mb-2 text-foreground">Create Account</h1>
        <p className="text-muted-foreground text-center text-sm mb-8">Join Mountinal Corp today</p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full glass-button-primary text-base disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link to="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </motion.div>

      {showAccountInfoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
          <div className="w-full max-w-xl glass-panel-strong p-6 space-y-5">
            <h2 className="font-display text-2xl font-bold text-foreground">Important: Save your account recovery details</h2>
            <p className="text-sm text-muted-foreground">
              Write these down in a secure file/password manager. You may need them if your account is compromised.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">Mountinal-HEX ID</label>
              <div className="flex items-center gap-2">
                <input
                  value={newHexId}
                  readOnly
                  className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none"
                />
                <button
                  onClick={() => copyValue(newHexId, "hex")}
                  className="glass-button-primary !py-2.5 text-sm inline-flex items-center gap-2"
                >
                  {copiedField === "hex" ? <Check size={14} /> : <Copy size={14} />} Copy
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-muted-foreground">User UID</label>
              <div className="flex items-center gap-2">
                <input
                  value={newUid}
                  readOnly
                  className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none"
                />
                <button
                  onClick={() => copyValue(newUid, "uid")}
                  className="glass-button-primary !py-2.5 text-sm inline-flex items-center gap-2"
                >
                  {copiedField === "uid" ? <Check size={14} /> : <Copy size={14} />} Copy
                </button>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                disabled={closeCooldown > 0}
                onClick={() => {
                  setShowAccountInfoModal(false);
                  navigate("/account");
                }}
                className="glass-button-primary !py-2.5 text-sm disabled:opacity-50"
              >
                {closeButtonLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
