import { createContext, useContext } from "react";

// Shared auth context — consumed by ProtectedRoute, PublicOnlyRoute, and
// any component that needs to know who the current user is.
export const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);
