import { useParams } from "react-router-dom";

type DirectMessageRouteParams = {
  username?: string;
};

export default function DirectMessageTab() {
  const { username } = useParams<DirectMessageRouteParams>();

  return (
    <div className="flex-1 px-10 py-8">
      {username ? (
        <div className="max-w-4xl flex flex-col gap-2">
          <h1 className="text-3xl font-bold">@{username}</h1>
          <p className="text-sm text-neutral-medium">
            TODO: render direct messages with {username}.
          </p>
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
