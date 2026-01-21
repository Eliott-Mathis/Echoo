import DirectMessageItem from "./DirectMessageItem";
import type { DirectMessage } from "../../types/messages";

export default function DirectMessageList({
  messages,
}: {
  messages: DirectMessage[];
}) {
  return (
    <div className="flex-1 min-h-0">
      <div className="flex flex-col gap-4 overflow-y-auto h-full flex-start-end justify-end">
        {messages.map((message) => (
          <DirectMessageItem key={message.id} message={message} />
        ))}
      </div>
    </div>
  );
}
