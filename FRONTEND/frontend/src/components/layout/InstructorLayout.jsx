import { Outlet, useNavigate } from "react-router-dom";
import { SidebarLayout } from "./SidebarLayout";
import { useAuth } from "../../contexts/AuthContext";

export default function InstructorLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", to: "/instructor/dashboard" },
    { label: "Create Assessment", to: "/instructor/builder" },
    { label: "Manage Assessments", to: "/instructor/tests" },
    { label: "AI Question Review", to: "/instructor/ai-questions" },
    { label: "Analytics", to: "/instructor/analytics/1" }, // assessmentId required
    { label: "Profile", to: "/instructor/profile" },
  ];

  return (
    <SidebarLayout
      title="Instructor Panel"
      navItems={navItems}
      variant="instructor"
      onLogout={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    >
      <Outlet />
    </SidebarLayout>
  );
}