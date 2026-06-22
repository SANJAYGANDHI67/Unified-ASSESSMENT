import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

/*
  RoleRedirect:
  - Used ONLY at "/"
  - No hooks in JSX
  - No side effects
*/
export default function RoleRedirect() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={`/${user.role}/dashboard`} replace />;
}
