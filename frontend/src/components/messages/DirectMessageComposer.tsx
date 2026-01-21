import type { LucideIcon } from "lucide-react";
import { Plus } from "lucide-react";

export default function DirectMessageComposer({
  username,
  icons,
}: {
  username: string;
  icons: Record<string, LucideIcon>;
}) {
  return (
    <div className="inputContainer flex items-center gap-3 w-full mt-auto">
      <div className="flex flex-row gap-2 bg-background-secondary border border-border-primary rounded-lg px-4 py-2 items-center w-full">
        <button aria-label="Add attachment">
          <Plus size={16} className="text-neutral-medium" />
        </button>
        <input
          type="text"
          placeholder={`Message @${username}`}
          className="text-sm text-input-primary-default-text placeholder:text-input-primary-default-placeholder outline-none w-full bg-transparent"
        />
      </div>
      <div className="flex items-center gap-1.5 text-neutral-medium">
        {Object.entries(icons).map(([key, Icon]) => (
          <button
            key={key}
            type="button"
            className="flex items-center border border-button-secondary-border p-2 rounded-md hover:bg-button-secondary-hover-background hover:border-button-secondary-hover-border transition-colors whitespace-nowrap"
          >
            <Icon size={20} color="white" />
          </button>
        ))}
      </div>
    </div>
  );
}
