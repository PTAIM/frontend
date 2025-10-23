import { Outlet, useNavigate } from "react-router";
import { useEffect } from "react";
import useAuth from "../hooks/useAuth";
import { Loading } from "../components/loading";

export default function ProtectedLayout() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return <Loading />;
  }

  return isAuthenticated ? <Outlet /> : null;
}
