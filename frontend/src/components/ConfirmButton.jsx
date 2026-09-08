import { useEffect, useState } from "react";

/**
 * Two-step confirm button for destructive/irreversible actions.
 * First click arms it ("Are you sure?"), second click fires `onConfirm`.
 */
export default function ConfirmButton({ label, confirmLabel = "Confirm?", onConfirm, className = "", disabled = false }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 2500);
    return () => clearTimeout(t);
  }, [armed]);

  if (armed) {
    return (
      <button
        className={`btn small danger ${className}`}
        disabled={disabled}
        onClick={() => {
          setArmed(false);
          onConfirm();
        }}
      >
        {confirmLabel}
      </button>
    );
  }
  return (
    <button className={`btn small ${className}`} disabled={disabled} onClick={() => setArmed(true)}>
      {label}
    </button>
  );
}