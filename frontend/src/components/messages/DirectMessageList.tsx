import DirectMessageItem from "./DirectMessageItem";
import type { DirectMessage } from "../../types/messages";

export default function DirectMessageList({
  messages,
}: {
  messages: DirectMessage[];
}) {
  const FIVE_MINUTES_MS = 5 * 60 * 1000;

  const getMessageTime = (message: DirectMessage) => {
    if (typeof message.createdAt === "number") {
      return message.createdAt;
    }

    if (typeof message.createdAt === "string") {
      const parsed = Date.parse(message.createdAt);
      return Number.isNaN(parsed) ? null : parsed;
    }

    return null;
  };

  const shouldGroupWithPrevious = (
    previous: DirectMessage | null,
    current: DirectMessage,
  ) => {
    if (!previous) {
      return false;
    }

    if (previous.author !== current.author) {
      return false;
    }

    const previousTime = getMessageTime(previous);
    const currentTime = getMessageTime(current);

    if (previousTime === null || currentTime === null) {
      return false;
    }

    return Math.abs(currentTime - previousTime) <= FIVE_MINUTES_MS;
  };

  const groupedMessages = messages.reduce<
    Array<{ id: string; messages: DirectMessage[] }>
  >((groups, message) => {
    const lastGroup = groups.at(-1) ?? null;
    const lastMessage = lastGroup?.messages.at(-1) ?? null;

    if (shouldGroupWithPrevious(lastMessage, message) && lastGroup) {
      lastGroup.messages.push(message);
      return groups;
    }

    groups.push({ id: message.id, messages: [message] });
    return groups;
  }, []);

  return (
    <div className="flex-1 min-h-0">
      <div className="flex flex-col gap-4 overflow-y-auto h-full flex-start-end justify-end">
        {groupedMessages.map((group) => (
          <div key={group.id} className="flex flex-col w-full">
            {group.messages.map((message, index) => (
              <DirectMessageItem
                key={message.id}
                message={message}
                showMeta={index === 0}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
