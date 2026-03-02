import { Check, Copy } from "lucide-react";

interface RegisterRecoveryModalProps {
  open: boolean;
  closeCooldown: number;
  hexId: string;
  uid: string;
  copiedField: "uid" | "hex" | "";
  onCopy: (value: string, field: "uid" | "hex") => void;
  onClose: () => void;
}

const RegisterRecoveryModal = ({
  open,
  closeCooldown,
  hexId,
  uid,
  copiedField,
  onCopy,
  onClose,
}: RegisterRecoveryModalProps) => {
  if (!open) return null;

  return (
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
              value={hexId}
              readOnly
              className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none"
            />
            <button
              onClick={() => onCopy(hexId, "hex")}
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
              value={uid}
              readOnly
              className="flex-1 glass-panel !rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent outline-none"
            />
            <button
              onClick={() => onCopy(uid, "uid")}
              className="glass-button-primary !py-2.5 text-sm inline-flex items-center gap-2"
            >
              {copiedField === "uid" ? <Check size={14} /> : <Copy size={14} />} Copy
            </button>
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            disabled={closeCooldown > 0}
            onClick={onClose}
            className="glass-button-primary !py-2.5 text-sm disabled:opacity-50"
          >
            {closeCooldown > 0 ? `Close (${closeCooldown}s)` : "Close"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegisterRecoveryModal;
