import { useNavigate } from "react-router-dom";
import { authClient } from "@/lib/authClient";
import { X } from "lucide-react";

export default function SettingsPopup() {
  const navigate = useNavigate();

  const handleClose = () => navigate("/home");

  const handleLogout = async () => {
    if (typeof authClient.signOut === "function") {
      await authClient.signOut();
    }
    navigate("/login");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/60"
        onClick={handleClose}
        aria-label="Close settings"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border-primary bg-background-secondary p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-neutral-highest">Settings</h2>
            <p className="text-sm text-neutral-medium">
              Manage your account preferences.
            </p>
          </div>
          <button
            type="button"
            className="rounded-lg border border-border-primary bg-background-primary px-1 py-1 text-xs font-semibold text-neutral-medium hover:text-neutral-highest hover:bg-neutral-lower transition-colors"
            onClick={handleClose}
          >
            <X size={16} />
          </button>
        </div>
        <div className="mt-6 flex flex-col gap-3">
          <button
            type="button"
            className="w-full rounded-lg bg-danger-low text-danger-highest text-sm font-semibold px-4 py-2 hover:bg-danger-medium transition-colors"
            onClick={handleLogout}
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
