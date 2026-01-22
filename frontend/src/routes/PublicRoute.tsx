import { Navigate, Outlet } from "react-router-dom";
import { authClient } from "@/lib/authClient";
import LoadingScreen from "@/components/LoadingScreen";

export default function PublicRoute() {
  const { data, isPending } = authClient.useSession();

  if (isPending) return <LoadingScreen />;

  if (data?.user) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
}
