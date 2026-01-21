import { Navigate, Outlet, useLocation } from "react-router-dom";
import { authClient } from "@/lib/authClient";
import LoadingScreen from "@/components/LoadingScreen";

export default function ProtectedRoute() {
  const location = useLocation();
  const { data, isPending } = authClient.useSession();

  if (isPending) return <LoadingScreen />;

  if (!data?.user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}
