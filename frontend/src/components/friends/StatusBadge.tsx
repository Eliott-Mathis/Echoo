import { Circle, Moon } from "lucide-react";
import type { UserPresence } from "@/types/userStatus";

type StatusBadgeProps = {
  presence: UserPresence;
  size?: number;
  className?: string;
};

const presenceConfig: Record<
  UserPresence,
  { label: string; colorClass: string; Icon: typeof Circle }
> = {
  online: { label: "Online", colorClass: "text-success-medium", Icon: Circle },
  away: { label: "Away", colorClass: "text-warning-medium", Icon: Moon },
  dnd: { label: "Do Not Disturb", colorClass: "text-danger-low", Icon: Circle },
  offline: { label: "Offline", colorClass: "text-neutral-medium", Icon: Circle },
};

export default function StatusBadge({
  presence,
  size = 16,
  className,
}: StatusBadgeProps) {
  const { label, colorClass, Icon } = presenceConfig[presence];
  const isDnd = presence === "dnd";
  const minusWidth = Math.max(4, Math.round(size * 0.4));
  const minusHeight = Math.max(2, Math.round(size * 0.15));

  return (
    <span
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-full bg-darkblue-400 ${
        className ?? ""
      }`}
      style={{ width: size, height: size }}
    >
      {isDnd ? (
        <>
          <span className="absolute inset-0 rounded-full bg-danger-low" />
          <span
            className="absolute rounded-full bg-darkblue-400"
            style={{ width: minusWidth, height: minusHeight }}
          />
        </>
      ) : (
        <Icon className={`${colorClass} fill-current`} size={size} />
      )}
    </span>
  );
}
