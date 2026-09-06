import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";
import SidebarMobile from "./SidebarMobile";

import {
  Settings,UserCog,ShieldCheck,  Bell,  LockKeyhole,  Palette,  Database,  Home,  Users,User,GraduationCap,
  BookOpen,FileText,Calendar,BarChart3,LayoutDashboard,CreditCard,ShoppingCart,Package,ClipboardList,MessageSquare,
  Mail,Phone,Camera,  Image,  Video,  MapPin,  Globe,  Server,  Code,  Folder,  FolderOpen,Key,Shield,Cpu,
    Wifi,  Search,  Menu,  Layers, Monitor,
} from "lucide-react";

const iconMap = {
  Settings,  UserCog,  ShieldCheck,  Bell,  LockKeyhole,  Palette,  Database,Home,Users,User,
  GraduationCap,  BookOpen,  FileText,  Calendar,BarChart3,
  LayoutDashboard,  CreditCard,  ShoppingCart,  Package,  ClipboardList,  MessageSquare,  Mail,  Phone, Camera,
  Image,  Video,  MapPin,  Globe,  Server,  Code,  Folder,  FolderOpen,  Key,  Shield,  Cpu,  Wifi,Search,
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

/* Stable color based on item id/name */
const getIconColor = (value = "") => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = value.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const isFlagOn = (value, defaultValue = true) => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  if (typeof value === "string") {
    return !["0", "false", "no", "off"].includes(
      value.trim().toLowerCase()
    );
  }

  return Boolean(value);
};

const Sidebar = () => {
  const { accessToken } = useAuth();
  const location = useLocation();
  const [openGroup, setOpenGroup] = useState("");
  const [dashboardNavItems, setDashboardNavItems] = useState([]);

  const getDashboardPath = (path = "") => {
    if (!path) {
      return "/dashboard";
    }

    if (path.startsWith("/dashboard")) {
      return path;
    }
    return `/dashboard/${path.replace(/^\/+/, "")}`;
  };

  const isRouteActive = (path) => {
    const dashboardPath = getDashboardPath(path);

    if (dashboardPath === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return (
      location.pathname === dashboardPath ||
      location.pathname.startsWith(`${dashboardPath}/`)
    );
  };

  const toggleGroup = (label, active) => {
    // Inactive module ko open nahi karna
    if (!active) {
      return;
    }

    setOpenGroup((prev) => (prev === label ? "" : label));
  };

  /*
  |--------------------------------------------------------------------------
  | FETCH MODULES
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (!accessToken) {
      setDashboardNavItems([]);
      return;
    }

    fetch(`${BASE_URI}/api/dashboard/modules`, {
      method: "GET",
      headers: { 
        Authorization: `Bearer ${accessToken}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to load dashboard modules");
        }

        return res.json();
      })
      .then((data) => {
        const modules = Array.isArray(data?.data)
          ? data.data
          : [];

        setDashboardNavItems(modules);
      })
      .catch((err) => {
        console.log("Dashboard modules error:", err);
        setDashboardNavItems([]);
      });
  }, [accessToken]);

  /*
  |--------------------------------------------------------------------------
  | AUTO OPEN ACTIVE GROUP
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    const activeGroup = dashboardNavItems.find((item) => {
      const visible = isFlagOn(item?.is_visible, true);
      const active = isFlagOn(item?.is_active, true);

      if (!visible || !active) {
        return false;
      }

      return item.children?.some((child) => {
        const childVisible = isFlagOn(
          child?.is_visible,
          true
        );

        const childActive = isFlagOn(
          child?.is_active,
          true
        );

        return (
          childVisible &&
          childActive &&
          isRouteActive(child.path)
        );
      });
    });

    if (activeGroup) {
      setOpenGroup(activeGroup.label);
    }
  }, [location.pathname, dashboardNavItems]);

  return (
    <>
      {/* =====================================================
          DESKTOP SIDEBAR
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
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              {/* Logo */}
              <div
                className="
                  flex
                  h-12
                  w-12
                  shrink-0
                  items-center
                  justify-center
                  overflow-hidden
                  rounded-xl
                  shadow-lg
                "
              >
                <img
                  src="/media/collegePic/logo.jpeg"
                  alt="Logo"
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Title */}
              <div className="min-w-0">
                <p
                  className="
                    text-xs
                    uppercase
                    tracking-[0.35em]
                    text-cyan-400
                  "
                >
                  Dashboard
                </p>

                <h2
                  className="
                    mt-1
                    truncate
                    text-xl
                    font-bold
                    text-white
                  "
                >
                  Smart Campus
                </h2>
                
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            NAVIGATION
        ====================================================== */}
        <div
          className="
            custom-scrollbar
            min-h-0
            flex-1
            overflow-y-auto
            px-3
            py-4
          "
        >
          <nav className="space-y-2">
            {dashboardNavItems.map((item) => {
              /*
              |--------------------------------------------------------------------------
              | VISIBILITY + ACTIVE STATUS
              |--------------------------------------------------------------------------
              */
              const itemVisible = isFlagOn(
                item?.is_visible,
                true
              );

              const itemActive = isFlagOn(
                item?.is_active,
                true
              );

              /*
              |--------------------------------------------------------------------------
              | is_visible = 0
              | Module completely hide
              |--------------------------------------------------------------------------
              */
              if (!itemVisible) {
                return null;
              }

              const Icon = item.icon
                ? iconMap[item.icon]
                : null;

              /*
              |--------------------------------------------------------------------------
              | Parent active only when module itself is active
              |--------------------------------------------------------------------------
              */
              const childHasActiveRoute =
                item.children?.some((child) => {
                  const childVisible = isFlagOn(
                    child?.is_visible,
                    true
                  );

                  const childActive = isFlagOn(
                    child?.is_active,
                    true
                  );

                  return (
                    childVisible &&
                    childActive &&
                    isRouteActive(child.path)
                  );
                });

              const active =
                itemActive &&
                ((item.path && isRouteActive(item.path)) ||
                  childHasActiveRoute);

              /*
              |--------------------------------------------------------------------------
              | Inactive parent cannot be opened
              |--------------------------------------------------------------------------
              */
              const showSubItems =
                Boolean(item.children?.length) &&
                itemActive &&
                openGroup === item.label;

              return (
                <div
                  key={item.id}
                  className={!itemActive ? "opacity-50" : ""}
                >
                  {/* =================================================
                      PARENT ITEM WITH CHILDREN
                  ================================================== */}
                  {item.children?.length ? (
                    <button
                      type="button"
                      disabled={!itemActive}
                      onClick={() =>
                        toggleGroup(
                          item.label,
                          itemActive
                        )
                      }
                      aria-disabled={!itemActive}
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
                          !itemActive
                            ? "cursor-not-allowed border-transparent text-slate-600"
                            : active
                            ? "border-cyan-500 bg-cyan-500/10 text-cyan-400"
                            : "border-transparent text-slate-300 hover:border-cyan-500 hover:bg-slate-900 hover:text-cyan-400"
                        }
                      `}
                    >
                      <div
                        className="
                          flex
                          min-w-0
                          items-center
                          gap-3
                        "
                      >
                        {Icon && (
                          <Icon
                            size={20}
                            className={
                              !itemActive
                                ? "text-slate-700"
                                : getIconColor(
                                    `${item.id}-${item.label}`
                                  )
                            }
                          />
                        )}

                        <span className="truncate">
                          {item.label}
                        </span>

                        {/* Disabled badge */}
                        {!itemActive && (
                          <span
                            className="
                              rounded-md
                              border
                              border-slate-700
                              bg-slate-900
                              px-1.5
                              py-0.5
                              text-[8px]
                              uppercase
                              tracking-wider
                              text-slate-600
                            "
                          >
                            Disabled
                          </span>
                        )}
                      </div>

                      {/* Arrow */}
                      <svg
                        className={`
                          h-4
                          w-4
                          shrink-0
                          transition-transform
                          duration-300

                          ${
                            showSubItems
                              ? "rotate-180"
                              : ""
                          }
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

                    itemActive ? (
                      <Link
                        to={getDashboardPath(item.path)}
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
                    ) : (
                      /* =================================================
                         INACTIVE SINGLE MODULE
                         Link ki jagah disabled div
                      ================================================== */
                      <div
                        aria-disabled="true"
                        className="
                          flex
                          cursor-not-allowed
                          items-center
                          gap-3
                          rounded-xl
                          border
                          border-transparent
                          px-4
                          py-3
                          text-sm
                          font-medium
                          text-slate-600
                        "
                      >
                        {Icon && (
                          <Icon
                            size={20}
                            className="text-slate-700"
                          />
                        )}

                        <span className="truncate">
                          {item.label}
                        </span>

                        <span
                          className="
                            ml-auto
                            rounded-md
                            border
                            border-slate-700
                            bg-slate-900
                            px-1.5
                            py-0.5
                            text-[8px]
                            uppercase
                            tracking-wider
                            text-slate-600
                          "
                        >
                          Disabled
                        </span>
                      </div>
                    )
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
                          ? "mt-2 max-h-[600px]"
                          : "max-h-0"
                      }
                    `}
                  >
                    <div
                      className="
                        ml-4
                        border-l
                        border-slate-700
                        pl-4
                      "
                    >
                      {item.children?.map((subItem) => {
                        /*
                        |--------------------------------------------------------------------------
                        | CHILD FLAGS
                        |--------------------------------------------------------------------------
                        */
                        const childVisible = isFlagOn(
                          subItem?.is_visible,
                          true
                        );

                        const childActive = isFlagOn(
                          subItem?.is_active,
                          true
                        );

                        /*
                        |--------------------------------------------------------------------------
                        | is_visible = 0
                        | Child completely hide
                        |--------------------------------------------------------------------------
                        */
                        if (!childVisible) {
                          return null;
                        }

                        const ChildIcon =
                          iconMap[subItem.icon] ||
                          Settings;

                        const subActive =
                          childActive &&
                          isRouteActive(subItem.path);

                        /*
                        |--------------------------------------------------------------------------
                        | ACTIVE CHILD
                        |--------------------------------------------------------------------------
                        */
                        if (childActive) {
                          return (
                            <Link
                              key={subItem.id}
                              to={getDashboardPath(
                                subItem.path
                              )}
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
                        }

                        /*
                        |--------------------------------------------------------------------------
                        | INACTIVE CHILD
                        | Click completely disabled
                        |--------------------------------------------------------------------------
                        */
                        return (
                          <div
                            key={subItem.id}
                            aria-disabled="true"
                            className="
                              group
                              mt-1
                              flex
                              cursor-not-allowed
                              items-center
                              gap-3
                              rounded-lg
                              px-3
                              py-2
                              text-sm
                              text-slate-700
                            "
                          >
                            <ChildIcon
                              size={16}
                              className="text-slate-800"
                            />

                            <span className="truncate">
                              {subItem.label}
                            </span>

                            <span
                              className="
                                ml-auto
                                rounded
                                border
                                border-slate-800
                                px-1
                                py-0.5
                                text-[7px]
                                uppercase
                                text-slate-700
                              "
                            >
                              Off
                            </span>
                          </div>
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

      {/* =====================================================
          MOBILE SIDEBAR

          IMPORTANT:
          SidebarMobile agar modules khud API se render karta hai,
          to usme bhi is_active / is_visible ka same logic lagana hoga.
      ====================================================== */}
      <SidebarMobile />
    </>
  );
};

export default Sidebar;