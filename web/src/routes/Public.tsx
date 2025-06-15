// src/routes/PublicRoute.tsx
import {Navigate} from "react-router-dom";
import {useAuth} from "../features/AuthContext";
import type {JSX} from "react";

export const PublicRoute = ({children}: { children: JSX.Element }) => {
  const {token} = useAuth();
  return token ? <Navigate to="/" replace/> : children;
};
