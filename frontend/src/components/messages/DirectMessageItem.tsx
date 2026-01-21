import type { DirectMessage } from "../../types/messages";

export default function DirectMessageItem({
  message,
}: {
  message: DirectMessage;
}) {
  return (
    <div className="flex items-start gap-3">
      <img src={message.avatarUrl} alt={message.author} className="h-10 w-10 rounded-full object-cover" />
      <div>
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold">
            {message.author}
          </span>
          <span className="text-sm text-neutral-medium">
            {message.timestamp}
          </span>
        </div>
        <p className="text-base text-input-primary-default-text">
          {message.content}
        </p>
      </div>
    </div>
  );
}
