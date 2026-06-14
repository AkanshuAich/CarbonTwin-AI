"use client";

interface ToggleSwitchProps {
  id: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

/**
 * Accessible toggle switch with an aria-labelled button and optional
 * description text. Replaces the duplicated AC / Electric Heating pattern
 * in EnergyStep and is reusable across the codebase.
 */
export function ToggleSwitch({
  id,
  label,
  description,
  checked,
  onChange,
}: ToggleSwitchProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-border">
      <div>
        <p className="font-medium text-sm" id={id}>
          {label}
        </p>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={id}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${
          checked ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
        <span className="sr-only">
          {checked ? `${label} enabled` : `${label} disabled`}
        </span>
      </button>
    </div>
  );
}
