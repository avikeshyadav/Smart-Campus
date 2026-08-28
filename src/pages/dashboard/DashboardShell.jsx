import DashboardLayout from "../../components/dashboard/layout/DashboardLayout";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const DashboardShell = ({ title, children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();


  const handleLogout = () => {

    logout(); // Context se token aur user clear

    navigate("/login");

  };


  return (
    <DashboardLayout 
        title={title} 
        onLogout={handleLogout}
    >
      {children}
    </DashboardLayout>
  ); 
};


export default DashboardShell;