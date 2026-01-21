type FriendsListTabProps = {
  title: string;
};

export default function FriendsListTab({ title }: FriendsListTabProps) {
  return (
    <div className="max-w-3xl flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>
      <p className="text-sm text-neutral-medium">
        TODO: render {title.toLowerCase()} friends list here.
      </p>
    </div>
  );
}
