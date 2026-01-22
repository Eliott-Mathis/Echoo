import { Gift, ImagePlay, SmilePlus, Sticker } from "lucide-react";
import { useParams } from "react-router-dom";
import DirectMessageComposer from "../../components/messages/DirectMessageComposer";
import DirectMessageHeader from "../../components/messages/DirectMessageHeader";
import DirectMessageList from "../../components/messages/DirectMessageList";
import type { DirectMessage } from "../../types/messages";

type DirectMessageRouteParams = {
  username?: string;
};

export default function DirectMessageTab() {
  const { username } = useParams<DirectMessageRouteParams>();

  const baseTime = Date.now();

  const icons = {
    gift: Gift,
    image: ImagePlay,
    sticker: Sticker,
    smile: SmilePlus,
  };

  const messages: DirectMessage[] = username
    ? [
        {
          id: "welcome",
          author: username,
          avatarUrl: `https://ui-avatars.com/api/?name=${username}&background=random&size=128`,
          content: `salut mec tu veux minecraft?`,
          timestamp: "Just now",
          createdAt: baseTime - 2 * 60 * 1000,
        },
        {
          id: "intro",
          author: "You",
          avatarUrl: `https://ui-avatars.com/api/?name=You&background=random&size=128`,
          content: "oui vas-y",
          timestamp: "Just now",
          createdAt: baseTime - 60 * 1000,
          isSelf: true,
        },
        {
          id: "intro-2",
          author: "You",
          avatarUrl: `https://ui-avatars.com/api/?name=You&background=random&size=128`,
          content: "c'est quoi l'IP",
          timestamp: "Just now",
          createdAt: baseTime - 30 * 1000,
          isSelf: true,
        },
      ]
    : [];

  return (
    <div className="flex-1 px-6 py-4 flex flex-col h-full">
      {username ? (
        <div className="w-full flex flex-col gap-6 h-full min-h-0">
          <DirectMessageHeader username={username} />
          <DirectMessageList messages={messages} />
          <DirectMessageComposer username={username} icons={icons} />
        </div>
      ) : (
        <div className="max-w-3xl flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Direct Messages</h1>
          <p className="text-sm text-neutral-medium">
            Select a conversation to start chatting.
          </p>
        </div>
      )}
    </div>
  );
}
