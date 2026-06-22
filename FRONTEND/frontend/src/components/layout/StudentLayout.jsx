import { Outlet, useNavigate } from "react-router-dom";
import { SidebarLayout } from "./SidebarLayout";
import { useAuth } from "../../contexts/AuthContext";

export default function StudentLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { label: "Dashboard", to: "/student/dashboard" },
    { label: "My Assessments", to: "/student/assessments" },
    { label: "My Submissions", to: "/student/submissions" },
    
  ];

  return (
    <SidebarLayout
      title="Unified Assessment"
      navItems={navItems}
      variant="student"     // 🟠 ORANGE
      onLogout={() => {
        logout();
        navigate("/login", { replace: true });
      }}
    >
      <Outlet />
    </SidebarLayout>
  );
}