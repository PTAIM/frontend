import { useContext } from "react";
import { authContext } from "~/contexts/auth";

export default function useAuth() {
  const context = useContext(authContext);
  if (!context) {
    throw new Error("useAuth needs an AuthProvider");
  }
  return context;
}
