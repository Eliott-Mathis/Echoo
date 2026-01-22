import { AtSign, Phone, Pin, ScreenShare, Search, Video } from "lucide-react";

// Socket Event Handler
import callUser from "@/lib/socketServices/socketCall";
import { useCallStore } from "@/stores/callStore";
import { authClient } from "@/lib/authClient";

type ControlIcon = {
  icon: React.ComponentType<any>;
  onClick: () => void;
};

export default function DirectMessageHeader({
  username
}: {
  username: string;
}) {
  const { startCall } = useCallStore()
  const user = authClient.useSession();

  const ControlsIcons: Record<string, ControlIcon> = {
    screenShare: {
      icon: ScreenShare,
      onClick: () => {}
    },
    video: {
      icon: Video,
      onClick: () => {}
    },
    phone: {
      icon: Phone,
      onClick: () => {
        if(!user.data?.user.name) return
        startCall([{username, profilePicture: ''}, {username: user.data.user.name, profilePicture: ''}]);
        
        //callUser(username)
      }
    },
    pin: {
      icon: Pin,
      onClick: () => {}
    }
  }



  return (
    <div className="flex items-center justify-between">
      <h1 className="text-xl flex items-center gap-2">
          <AtSign size={24} className="inline-block" />
          {username}
      </h1>
      <div className="flex items-center gap-4">
        {Object.entries(ControlsIcons).map(([key, Icon]) => (
          <button key={key} className="py-1.5 text-neutral-medium hover:text-white transition-colors" onClick={() => Icon.onClick()}>
            <Icon.icon size={20} className="inline-block" />
          </button>
        ))}
        <label className="flex items-center gap-2 bg-neutral-lowest border border-input-primary-default-border rounded-md px-3 py-1">
          <Search size={16} className="text-input-primary-default-icon" />
          <input
            type="text"
            placeholder="Search"
            className="w-32 whitespace-nowrap bg-transparent text-sm text-input-primary-default-text placeholder:text-input-primary-default-placeholder outline-none"
          />
        </label>
      </div>
    </div>
  );
}
