import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  X,
  ChevronDown,
  Settings,
  UserCog,
  ShieldCheck,
  Bell,
  LockKeyhole,
  Palette,
  Database,
  Home,
  Users,
  User,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  Package,
  ClipboardList,
  MessageSquare,
  Mail,
  Phone,
  Camera,
  Image,
  Video,
  MapPin,
  Globe,
  Server,
  Code,
  Folder,
  FolderOpen,
  Key,
  Shield,
  Cpu,
  Wifi,
  Search,
  Layers,
  Monitor,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

const iconMap = {
  Settings,
  UserCog,
  ShieldCheck,
  Bell,
  LockKeyhole,
  Palette,
  Database,
  Home,
  Users,
  User,
  GraduationCap,
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  LayoutDashboard,
  CreditCard,
  ShoppingCart,
  Package,
  ClipboardList,
  MessageSquare,
  Mail,
  Phone,
  Camera,
  Image,
  Video,
  MapPin,
  Globe,
  Server,
  Code,
  Folder,
  FolderOpen,
  Key,
  Shield,
  Cpu,
  Wifi,
  Search,
  Layers,
  Monitor,
};

const colors = [
  "text-red-500",
  "text-green-500",
  "text-blue-500",
  "text-yellow-500",
  "text-pink-500",
  "text-purple-500",
  "text-orange-500",
  "text-cyan-500",
  "text-indigo-500",
  "text-emerald-500",
];

const getIconColor = (value = "") => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const SidebarMobile = () => {
  const { accessToken } = useAuth();
  const location = useLocation();

  const [open, setOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState("");
  const [dashboardNavItems, setDashboardNavItems] = useState([]);

  // ==============================
  // GET MODULES
  // ==============================

  useEffect(() => {
    if (!accessToken) return;

    fetch(`${BASE_URI}/api/dashboard/modules`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDashboardNavItems(data.data || []);
      })
      .catch((err) => {
        console.log(err);
        setDashboardNavItems([]);
      });
  }, [accessToken]);

  // ==============================
  // CLOSE ON ROUTE CHANGE
  // ==============================

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // ==============================
  // LOCK BODY SCROLL
  // ==============================

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (path) => {
    if (!path) return false;

    return path === "/dashboard"
      ? location.pathname === path
      : location.pathname === path ||
          location.pathname.startsWith(`${path}/`);
  };

  const toggleGroup = (label) => {
    setOpenGroup((prev) => (prev === label ? "" : label));
  };

  return (
    <>
      {/* =========================================
          MOBILE TOP BAR
      ========================================== */}

      <div
        className="
          fixed
          left-0
          right-0
          top-0
          z-[9990]
          flex
          h-16
          items-center
          justify-between
          border-b
          border-slate-700
          bg-slate-950
          px-4
          shadow-xl
          lg:hidden
        "
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg">
            <img
              src="/media/collegePic/logo.jpeg"
              alt="Logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.25em] text-cyan-400">
              Dashboard
            </p>

            <h2 className="text-sm font-bold text-white">
              Student Vision
            </h2>
          </div>
        </div>

        {/* ==============================
            HAMBURGER
        ============================== */}

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            border-2
            border-cyan-400
            bg-slate-900
            text-cyan-400
            shadow-lg
            hover:bg-cyan-500
            hover:text-white
            active:scale-95
          "
        >
          <Menu size={26} />
        </button>
      </div>

      {/* =========================================
          OVERLAY
      ========================================== */}

      {open && (
        <div
          onClick={() => setOpen(false)}
          className="
            fixed
            inset-0
            z-[9998]
            bg-black/70
            lg:hidden
          "
        />
      )}

      {/* =========================================
          MOBILE SIDEBAR
      ========================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[9999]
          flex
          h-screen
          w-[285px]
          flex-col
          overflow-hidden
          border-r
          border-slate-700
          bg-slate-950
          shadow-2xl
          transition-transform
          duration-300
          lg:hidden

          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* =====================================
            HEADER
        ====================================== */}

        <div
          className="
            flex
            h-20
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-700
            bg-slate-950
            px-4
          "
        >
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl">
              <img
                src="/media/collegePic/logo.jpeg"
                alt="Logo"
                className="h-full w-full object-cover"
              />
            </div>

            <div>
              <p className="text-[10px] uppercase tracking-[0.3em] text-cyan-400">
                Dashboard
              </p>

              <h2 className="text-lg font-bold text-white">
                Student Vision
              </h2>
            </div>
          </div>

          {/* CLOSE */}

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-xl
              border-2
              border-red-500
              bg-red-500/10
              text-red-400
              hover:bg-red-500
              hover:text-white
            "
          >
            <X size={24} />
          </button>
        </div>

        {/* =====================================
            NAVIGATION
        ====================================== */}

        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-950 px-3 py-4">
          <nav className="space-y-2">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon
                ? iconMap[item.icon]
                : null;

              const active =
                (item.path && isActive(item.path)) ||
                item.children?.some(
                  (child) => location.pathname === child.path
                );

            const hasChildren =
              Array.isArray(item.children) &&
              item.children.length > 0;

            const showSubItems =
              hasChildren && openGroup === item.label;
              return (
                <div key={item.id}>
                  {hasChildren ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className={`
                        flex
                        w-full
                        items-center
                        justify-between
                        rounded-xl
                        border
                        px-4
                        py-3
                        text-sm
                        font-medium

                        ${
                          active
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                            : "border-transparent text-slate-300 hover:bg-slate-900"
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        {Icon && (
                          <Icon
                            size={20}
                            className={getIconColor(
                              `${item.id}-${item.label}`
                            )}
                          />
                        )}

                        <span>{item.label}</span>
                      </div>

                      <ChevronDown
                        size={17}
                        className={
                          showSubItems
                            ? "rotate-180"
                            : ""
                        }
                      />
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border
                        px-4
                        py-3
                        text-sm
                        font-medium

                        ${
                          active
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                            : "border-transparent text-slate-300 hover:bg-slate-900"
                        }
                      `}
                    >
                      {Icon && (
                        <Icon
                          size={20}
                          className={getIconColor(
                            `${item.id}-${item.label}`
                          )}
                        />
                      )}

                      <span>{item.label}</span>
                    </Link>
                  )}

                  {/* CHILDREN */}

                  {showSubItems && (
                    <div className="ml-4 mt-2 border-l border-slate-700 pl-4">
                      {item.children?.map((subItem) => {
                        const ChildIcon =
                          iconMap[subItem.icon] || Settings;

                        const subActive =
                          location.pathname === subItem.path;

                        return (
                          <Link
                            key={subItem.id}
                            to={subItem.path}
                            className={`
                              mt-1
                              flex
                              items-center
                              gap-3
                              rounded-lg
                              px-3
                              py-2
                              text-sm

                              ${
                                subActive
                                  ? "bg-cyan-500/15 text-cyan-400"
                                  : "text-slate-400 hover:bg-slate-900"
                              }
                            `}
                          >
                            <ChildIcon size={16} />

                            <span>{subItem.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default SidebarMobile;