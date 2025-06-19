import { Navigate } from "react-router-dom";
import { useAuth } from "../features/AuthContext";
import type { JSX } from "react";

export const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return <div>Loading session...</div>;
  }

  if (!token) {
    return <Navigate to="/login" replace/>;
  }

  return children;
};