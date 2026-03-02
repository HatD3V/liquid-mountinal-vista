import { FormEvent, useEffect, useMemo, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const defaultAdminActionPath = "/api/admin/force-update";
const adminActionUrl = (import.meta.env.VITE_ADMIN_FORCE_UPDATE_URL as string | undefined) || defaultAdminActionPath;

const AdminOverride = () => {
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [targetUid, setTargetUid] = useState("");
  const [targetEmail, setTargetEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const hasAnyTarget = useMemo(() => Boolean(targetUid.trim() || targetEmail.trim()), [targetUid, targetEmail]);

  useEffect(() => {
    const verifyAdmin = async () => {
      setCheckingAccess(true);
      setError("");

      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setAuthorized(false);
          setError("You must be signed in to access this page.");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const isAdmin = Boolean(userDoc.data()?.admin);

        if (!isAdmin) {
          setAuthorized(false);
          setError("Admin access denied.");
          return;
        }

        setAuthorized(true);
      } catch {
        setAuthorized(false);
        setError("Unable to verify admin access.");
      } finally {
        setCheckingAccess(false);
      }
    };

    verifyAdmin();
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!authorized) {
      setError("Admin access required.");
      return;
    }

    if (!hasAnyTarget) {
      setError("Provide either a target UID or target email.");
      return;
    }

    if (!newEmail.trim() || !newPassword.trim()) {
      setError("New email and new password are required.");
      return;
    }

    setSubmitting(true);

    try {
      const token = await auth.currentUser?.getIdToken(true);
      if (!token) {
        setError("Unable to read admin session token.");
        return;
      }

      const response = await fetch(adminActionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          targetUid: targetUid.trim() || undefined,
          targetEmail: targetEmail.trim().toLowerCase() || undefined,
          newEmail: newEmail.trim().toLowerCase(),
          newPassword: newPassword.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string; error?: string };

      if (!response.ok) {
        setError(payload.error || "Force update request failed.");
        return;
      }

      setMessage(payload.message || "User email and password were updated.");
      setTargetUid("");
      setTargetEmail("");
      setNewEmail("");
      setNewPassword("");
    } catch {
      setError("Request failed while trying to force-update account credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  if (checkingAccess) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="container mx-auto max-w-2xl py-16 text-sm text-muted-foreground">Checking admin access...</div>
      </div>
    );
  }

  if (!authorized) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="container mx-auto max-w-2xl py-16">
          <div className="glass-panel-strong p-8">
            <h1 className="font-display text-2xl font-bold text-foreground mb-2">Admin Override</h1>
            <p className="text-sm text-destructive">{error || "Access denied."}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="container mx-auto max-w-2xl py-16">
        <div className="glass-panel-strong p-8">
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">Admin Override</h1>
          <p className="text-sm text-muted-foreground mb-6">
            Hidden admin tool. Requires <code>users/{"{uid}"}.admin = true</code>. Uses <code>{adminActionUrl}</code> as the admin action endpoint (override with <code>VITE_ADMIN_FORCE_UPDATE_URL</code>).
          </p>

          {error && <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">{error}</div>}
          {message && <div className="mb-4 p-3 rounded-lg bg-primary/10 text-primary text-sm">{message}</div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Target UID (optional if email provided)</label>
              <input
                value={targetUid}
                onChange={(e) => setTargetUid(e.target.value)}
                className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Firebase UID"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Target Email (optional if UID provided)</label>
              <input
                type="email"
                value={targetEmail}
                onChange={(e) => setTargetEmail(e.target.value)}
                className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="current-user@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">New Email (required)</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="new-email@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">New Password (required)</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full glass-panel !rounded-xl px-4 py-3 text-sm text-foreground bg-transparent outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Minimum 8 characters"
              />
            </div>

            <button type="submit" disabled={submitting} className="w-full glass-button-primary text-base disabled:opacity-50">
              {submitting ? "Applying override..." : "Force Update User Credentials"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminOverride;
