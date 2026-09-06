import DashboardLayout from "../../components/dashboard/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";

const DashboardShell = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DashboardLayout
      onLogout={handleLogout}
    >
      <Outlet />
    </DashboardLayout>
  );
};

export default DashboardShell;