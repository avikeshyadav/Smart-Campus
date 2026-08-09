
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";
import SidebarMobile from "./SidebarMobile";

import {
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
  Menu,
  Layers,
  Monitor,
} from "lucide-react";

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
  Menu,
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

// Stable color based on item id/name
const getIconColor = (value = "") => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const Sidebar = () => {
  const { accessToken } = useAuth();
  const location = useLocation();

  const [openGroup, setOpenGroup] = useState("");
  const [dashboardNavItems, setDashboardNavItems] = useState([]);



  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === path
      : location.pathname === path ||
        location.pathname.startsWith(`${path}/`);
  const toggleGroup = (label) => {
   setOpenGroup((prev) => (prev === label ? "" : label));
  };
  /*
   * Fetch dashboard modules
   */
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


  return (
    <>

      {/* =====================================================
          SIDEBAR
      ====================================================== */}

      <aside
    className="
    fixed
    left-0
    top-0
    z-50
    hidden
    h-screen
    w-[260px]
    flex-col
    overflow-hidden
    border-r
    border-slate-800
    bg-slate-950
    shadow-2xl
    lg:flex
  "
>
        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className=" flex h-20 shrink-0 items-center justify-between border-b border-slate-700 bg-slate-950 px-4 ">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-lg">
                <img
                  src="/media/collegePic/logo.jpeg"
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.35em] text-cyan-400">
                  Dashboard
                </p>

                <h2 className="mt-1 truncate text-xl font-bold text-white">
                  Student Vision
                </h2>
              </div>
            </div>

            {/* Mobile Close Button */}

          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}

        <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-3 py-4">
          <nav className="space-y-2">
            {dashboardNavItems.map((item) => {
              const Icon = item.icon ? iconMap[item.icon] : null;

              const active =
                (item.path && isActive(item.path)) ||
                item.children?.some(
                  (child) => location.pathname === child.path
                );

              const showSubItems =
                item.children?.length &&
                openGroup === item.label;

              return (
                <div key={item.id}>
                  {/* =================================================
                      PARENT ITEM
                  ================================================== */}

                  {item.children?.length ? (
                    <button
                      type="button"
                      onClick={() => toggleGroup(item.label)}
                      className={`
                        group
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
                        transition-all
                        duration-300

                        ${
                          active
                            ? "border-green-500 bg-cyan-500/10 text-cyan-400"
                            : "border-transparent text-slate-300 hover:border-cyan-500 hover:bg-slate-900 hover:text-cyan-400"
                        }
                      `}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        {Icon && (
                          <Icon
                            size={20}
                            className={getIconColor(
                              `${item.id}-${item.label}`
                            )}
                          />
                        )}

                        <span className="truncate">
                          {item.label}
                        </span>
                      </div>

                      <svg
                        className={`
                          h-4
                          w-4
                          shrink-0
                          transition-transform
                          duration-300

                          ${showSubItems ? "rotate-180" : ""}
                        `}
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>
                  ) : (
                    /* =================================================
                       SINGLE LINK
                    ================================================== */

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
                        transition-all
                        duration-300

                        ${
                          active
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                            : "border-transparent text-slate-300 hover:border-cyan-500 hover:bg-slate-900 hover:text-cyan-400"
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

                      <span className="truncate">
                        {item.label}
                      </span>
                    </Link>
                  )}

                  {/* =================================================
                      DROPDOWN CHILDREN
                  ================================================== */}

                  <div
                    className={`
                      overflow-hidden
                      transition-all
                      duration-300

                      ${
                        showSubItems
                          ? "mt-2 max-h-96"
                          : "max-h-0"
                      }
                    `}
                  >
                    <div className="ml-4 border-l border-slate-700 pl-4">
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
                              group
                              mt-1
                              flex
                              items-center
                              gap-3
                              rounded-lg
                              px-3
                              py-2
                              text-sm
                              transition-all
                              duration-300

                              ${
                                subActive
                                  ? "bg-cyan-500/15 font-medium text-cyan-400"
                                  : "text-slate-400 hover:bg-slate-900 hover:text-cyan-400"
                              }
                            `}
                          >
                            <ChildIcon
                              size={16}
                              className={getIconColor(
                                `${subItem.id}-${subItem.label}`
                              )}
                            />

                            <span className="truncate">
                              {subItem.label}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      </aside>
      <SidebarMobile />
      
    </>
  );
};

export default Sidebar;