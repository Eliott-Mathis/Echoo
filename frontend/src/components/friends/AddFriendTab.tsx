import { UserPlus2 } from "lucide-react";

export default function AddFriendTab() {
  return (
    <div className="max-w-3xl flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Add Friend</h1>
        <p className="text-sm text-neutral-medium">
          You can add friends using their Echoo username (not display name!).
        </p>
      </div>
      <div className="inputContainer flex items-center gap-3 w-full">
        <div className="bg-background-secondary border border-border-primary rounded-lg px-4 py-2 flex items-center gap-1 w-full">
          <input
            type="text"
            placeholder="Username"
            className="text-sm text-input-primary-default-text placeholder:text-input-primary-default-placeholder outline-none w-full"
          />
        </div>
        <button
          type="button"
          className="flex items-center bg-success-medium text-success-lowest text-sm font-semibold px-4 py-2 rounded-md hover:bg-success-high transition-colors whitespace-nowrap"
        >
          Add Friend
          <UserPlus2 size={16} className="inline-block ml-2" />
        </button>
      </div>
      <div className="text-xs text-neutral-medium text-red-600">
        TODO: add validation, error state, or pending state here
      </div>
    </div>
  );
}
