import type { LucideIcon } from 'lucide-react';
import { Plus } from 'lucide-react';
import { useState } from 'react';
import TextareaAutosize from 'react-textarea-autosize';

export default function DirectMessageComposer({ username, icons, onSend, isSending = false }: { username: string; icons: Record<string, LucideIcon>; onSend: (content: string) => void; isSending?: boolean }) {
  const [message, setMessage] = useState('');
  const canSend = message.trim().length > 0 && !isSending;

  const handleSend = () => {
    if (!canSend) return;
    onSend(message.trim());
    setMessage('');
  };
  return (
    <div className="inputContainer flex items-center gap-3 w-full mt-auto">
      <div className="flex flex-row gap-2 bg-background-secondary border border-border-primary rounded-lg px-4 py-2 items-center w-full">
        <button aria-label="Add attachment">
          <Plus size={16} className="text-neutral-medium" />
        </button>
        <TextareaAutosize
          minRows={1}
          maxRows={6}
          placeholder={`Message @${username}`}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              handleSend();
            }
          }}
          className="scrollbar-echoo text-sm text-input-primary-default-text placeholder:text-input-primary-default-placeholder outline-none w-full bg-transparent resize-none overflow-y-auto leading-5"
        />
      </div>
      <div className="flex items-center gap-1.5 text-neutral-medium">
        {Object.entries(icons).map(([key, Icon]) => (
          <button key={key} type="button" className="flex items-center border border-button-secondary-border p-2 rounded-md hover:bg-button-secondary-hover-background hover:border-button-secondary-hover-border transition-colors whitespace-nowrap">
            <Icon size={20} color="white" />
          </button>
        ))}
      </div>
    </div>
  );
}
