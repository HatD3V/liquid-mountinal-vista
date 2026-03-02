import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import GlassCard from "@/components/GlassCard";
import Footer from "@/components/Footer";
import { User, Key, Monitor, LogOut, Copy, Check, Mail } from "lucide-react";
import { toast } from "sonner";

const Account = () => {
  const { user, profile, updateDisplayName, changePassword, changeEmail, sendVerification, sessions, refreshSessions, logout } = useAuth();
  const [displayName, setDisplayName] = useState(profile?.displayName || "");
  const [newPassword, setNewPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshSessions();
  }, []);

  useEffect(() => {
    if (profile?.displayName) setDisplayName(profile.displayName);
  }, [profile]);

  const handleUpdateName = async () => {
    setSaving(true);
    try {
      await updateDisplayName(displayName);
      toast.success("Display name updated");
    } catch (err: any) {
      toast.error(err?.message || "Failed to update");
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    try {
      await changePassword(newPassword);
      setNewPassword("");
      toast.success("Password changed successfully");
    } catch (err: any) {
      toast.error(err?.message || "Failed to change password. You may need to re-login first.");
    }
    setSaving(false);
  };

  const handleChangeEmail = async () => {
    const normalizedEmail = newEmail.trim().toLowerCase();

    if (!normalizedEmail) {
      toast.error("Please enter a new email address");
      return;
    }

    if (normalizedEmail === user?.email?.toLowerCase()) {
      toast.error("This is already your current email");
      return;
    }

    setSaving(true);
    try {
      await changeEmail(normalizedEmail);
      setNewEmail("");
      toast.success("Verification sent to your new email. Confirm it to complete the change.");
    } catch (err: any) {
      toast.error(err?.message || "Failed to start email change. You may need to re-login first.");
    }
    setSaving(false);
  };

  const handleResendVerification = async () => {
    setSaving(true);
    try {
      await sendVerification();
      toast.success("Verification email sent");
    } catch (err: any) {
      toast.error(err?.message || "Failed to send verification email");
    }
    setSaving(false);
  };

  const copyHexId = () => {
    if (profile?.hexId) {
      navigator.clipboard.writeText(String(profile.hexId));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen pt-24">
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-4xl sm:text-5xl font-bold mb-2 text-foreground">
            Account <span className="gradient-text">Settings</span>
          </h1>
          <p className="text-muted-foreground mb-12">Manage your Mountinal Corp account</p>
        </motion.div>

        {/* Profile Info */}
        <GlassCard className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="text-primary" size={20} />
            <h2 className="font-display text-xl font-semibold text-foreground">Profile</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
              <p className="text-foreground">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Mountinal-HEX ID</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg text-primary tracking-wider">{profile?.hexId || "..."}</code>
                <button onClick={copyHexId} className="text-muted-foreground hover:text-foreground transition-colors">
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Email Verification</label>
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                    user?.emailVerified ? "bg-emerald-500/15 text-emerald-600" : "bg-amber-500/15 text-amber-600"
                  }`}
                >
                  {user?.emailVerified ? "Verified" : "Not Verified"}
                </span>
                {!user?.emailVerified && (
                  <button
                    onClick={handleResendVerification}
                    disabled={saving}
                    className="text-sm text-primary hover:underline disabled:opacity-50"
                  >
                    Resend verification email
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Change Email</label>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="new-email@example.com"
                />
                <button
                  onClick={handleChangeEmail}
                  disabled={saving}
                  className="glass-button-primary text-sm !py-2.5 inline-flex items-center gap-2"
                >
                  <Mail size={14} />
                  Change Email
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-muted-foreground mb-1">Display Name</label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="Your display name"
                />
                <button
                  onClick={handleUpdateName}
                  disabled={saving}
                  className="glass-button-primary text-sm !py-2.5"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        {/* Change Password */}
        <GlassCard className="mb-6" delay={0.1}>
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-primary" size={20} />
            <h2 className="font-display text-xl font-semibold text-foreground">Change Password</h2>
          </div>
          <div className="flex gap-3">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="New password"
            />
            <button
              onClick={handleChangePassword}
              disabled={saving}
              className="glass-button-primary text-sm !py-2.5"
            >
              Update
            </button>
          </div>
        </GlassCard>

        {/* Sessions */}
        <GlassCard className="mb-6" delay={0.2}>
          <div className="flex items-center gap-3 mb-6">
            <Monitor className="text-primary" size={20} />
            <h2 className="font-display text-xl font-semibold text-foreground">Sessions</h2>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sessions recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {sessions.slice(0, 10).map((s, i) => (
                <div key={s.id || i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.device}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.timestamp instanceof Date ? s.timestamp.toLocaleString() : "Unknown"} · IP: {s.ip}
                    </p>
                  </div>
                  {i === 0 && (
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/15 text-primary">
                      Current
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </GlassCard>

        {/* Logout */}
        <GlassCard delay={0.3}>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-destructive hover:underline text-sm font-medium"
          >
            <LogOut size={16} />
            Logout from current session
          </button>
        </GlassCard>
      </div>
      <Footer />
    </div>
  );
};

export default Account;
