import { NavLink } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

type SidebarNavTabProps = {
  to: string;
  label: string;
  icon: LucideIcon;
  badgeCount?: number;
};

export default function SidebarNavTab({
  to,
  label,
  icon: Icon,
  badgeCount,
}: SidebarNavTabProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition-all ${
          isActive
            ? "bg-neutral-lower text-neutral-highest shadow-sm"
            : "text-neutral-medium hover:bg-neutral-lower hover:text-neutral-highest"
        }`
      }
    >
      <span className="flex items-center gap-3">
        <Icon size={20} className="text-current" />
        {label}
      </span>
      {typeof badgeCount === "number" && (
        <span className="min-w-6 text-center bg-danger-low text-danger-highest text-xs font-semibold px-2 py-0.5 rounded-full">
          {badgeCount}
        </span>
      )}
    </NavLink>
  );
}
