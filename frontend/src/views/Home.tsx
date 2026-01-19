import { authClient } from "@/lib/authClient"

// Components
import ServerList from "@/components/ServerList";

export default function Home() {
  const { data, isPending, error } = authClient.useSession();

  if (isPending) return <p>Loading...</p>;
  if (error) return <p>Erreur</p>;
  if (!data?.user) return <p>Non connecté</p>;

  return (
    <div>
      <ServerList/>
    </div>
  );
}
