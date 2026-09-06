import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

import {
  Settings,
  ChevronDown,
  ChevronUp,
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
  Pencil,
  Shield,
  Cpu,
  Wifi,
  Search,
  Menu,
  Layers,
  Monitor,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";


// =====================================================
// Icon Map
// =====================================================
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
  Pencil,
  Shield,
  Cpu,
  Wifi,
  Search,
  Menu,
  Layers,
  Monitor,
};


// =====================================================
// Default Form
// =====================================================
const defaultFormData = {
  parent_id: "",
  label: "",
  path: "",
  icon: "Settings",
  is_active: 1,
  is_visible: 1,
  sort_order: 0,
};


// =====================================================
// Component
// =====================================================
const Components = () => {
  const { accessToken } = useAuth();

  const [modules, setModules] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);

  const [formData, setFormData] = useState(defaultFormData);

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(null);


  // =====================================================
  // Load Modules
  // =====================================================
  const loadModules = async () => {
    if (!accessToken) return;

    try {
      setLoading(true);

      const res = await fetch(
        `${BASE_URI}/api/dashboard/modules`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to load modules"
        );
      }

      setModules(data.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to load modules");
    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // Load on token available
  // =====================================================
  useEffect(() => {
    loadModules();
  }, [accessToken]);


  // =====================================================
  // Reset Form
  // =====================================================
  const resetForm = () => {
    setFormData(defaultFormData);
    setIsEdit(false);
    setEditId(null);
  };


  // =====================================================
  // Edit Module
  // =====================================================
  const editModule = (module) => {
    setIsEdit(true);
    setEditId(module.id);

    setFormData({
      parent_id: module.parent_id ?? "",
      label: module.label ?? "",
      path: module.path ?? "",
      icon: module.icon || "Settings",
      is_active: Number(module.is_active) ? 1 : 0,
      is_visible: Number(module.is_visible) ? 1 : 0,
      sort_order: module.sort_order ?? 0,
    });
  };


  // =====================================================
  // Add Module
  // =====================================================
  const addModule = async () => {
    if (!formData.label.trim()) {
      toast.error("Module label is required");
      return;
    }

    if (!formData.path.trim()) {
      toast.error("Module path is required");
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URI}/api/dashboard/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to add module"
        );
      }

      toast.success("Module added successfully");

      resetForm();

      await loadModules();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to add module");
    }
  };


  // =====================================================
  // Update Module
  // =====================================================
  const updateModule = async () => {
    if (!editId) return;

    try {
      const response = await fetch(
        `${BASE_URI}/api/dashboard/modules/${editId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update module"
        );
      }

      toast.success("Module updated successfully");

      resetForm();

      await loadModules();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to update module");
    }
  };


  // =====================================================
  // Delete Module
  // =====================================================
  const deleteModule = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this module and its children?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `${BASE_URI}/api/dashboard/modules/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to delete module"
        );
      }

      toast.success("Module deleted successfully");

      if (openMenu === id) {
        setOpenMenu(null);
      }

      await loadModules();
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to delete module");
    }
  };


  // =====================================================
  // Toggle Module Status
  // =====================================================
  const toggleModule = async (module) => {
    try {
      const response = await fetch(
        `${BASE_URI}/api/dashboard/modules/${module.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            is_active: Number(module.is_active) ? 0 : 1,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update status"
        );
      }

      toast.success(
        Number(module.is_active)
          ? "Module disabled"
          : "Module enabled"
      );

      await loadModules();
    } catch (error) {
      console.error(error);
      toast.error(
        error.message || "Failed to update module status"
      );
    }
  };


  // =====================================================
  // Change Module Order
  // =====================================================
const changeOrder = async (id, direction) => {
  try {
    const response = await fetch(
      `${BASE_URI}/api/dashboard/modules/${id}/order`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          direction,
        }),
      }
    );

    // Pehle text lo
    const text = await response.text();

    let data;

    try {
      data = JSON.parse(text);
    } catch (jsonError) {
      console.error("API returned non-JSON response:", text);

      throw new Error(
        `Server returned ${response.status} ${response.statusText}`
      );
    }

    if (!response.ok) {
      throw new Error(data.message || "Failed to change module order");
    }

    await loadModules();

    toast.success(
      direction === "up"
        ? "Module moved up"
        : "Module moved down"
    );
  } catch (error) {
    console.error("Change order error:", error);
    toast.error(error.message || "Failed to change module order");
  }
};



  // =====================================================
  // Parent Form Options
  // =====================================================
  const parentOptions = modules.filter(
    (item) => Number(item.id) !== Number(editId)
  );


  return (
    <div className="grid gap-4 lg:grid-cols-3">

      {/* =================================================
          LEFT MODULE LIST
      ================================================= */}
      <div className="lg:col-span-2">

        <section className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900/90
          p-6
        ">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Dashboard Modules
            </h2>

            {loading && (
              <span className="text-xs text-slate-400">
                Loading...
              </span>
            )}
          </div>


          <div className="space-y-2">

            {modules.length === 0 && !loading && (
              <div className="
                rounded-xl
                border
                border-dashed
                border-slate-700
                p-8
                text-center
                text-slate-400
              ">
                No modules found.
              </div>
            )}


            {modules.map((parent, parentIndex) => {

              const ParentIcon =
                iconMap[parent.icon] || Settings;

              const isFirstParent = parentIndex === 0;
              const isLastParent =
                parentIndex === modules.length - 1;


              return (
                <div
                  key={parent.id}
                  className="
                    overflow-hidden
                    rounded-xl
                    border
                    border-slate-800
                    bg-slate-950/70
                  "
                >

                  {/* =====================================
                      PARENT HEADER
                  ====================================== */}
                  <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    p-3
                    hover:bg-slate-900
                  ">

                    <div className="flex min-w-0 items-center gap-3">

                      <ParentIcon
                        className="shrink-0 text-cyan-400"
                        size={22}
                      />

                      <div className="min-w-0">

                        <h3 className="
                          truncate
                          font-semibold
                          text-white
                        ">
                          {parent.label}
                        </h3>

                        <p className="
                          truncate
                          text-xs
                          text-slate-400
                        ">
                          {parent.path}
                        </p>

                        <p className="
                          mt-1
                          text-[10px]
                          text-slate-600
                        ">
                          Order: {parent.sort_order}
                        </p>

                      </div>

                    </div>


                    <div className="
                      flex
                      shrink-0
                      items-center
                      gap-2
                    ">

                      {/* Status */}
                      <span
                        className={`
                          rounded
                          px-2
                          py-1
                          text-xs
                          font-semibold
                          ${
                            Number(parent.is_active)
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                          }
                        `}
                      >
                        {Number(parent.is_active)
                          ? "Enabled"
                          : "Disabled"}
                      </span>


                      {/* UP */}
                      <button
                        type="button"
                        disabled={
                          isFirstParent ||
                          orderLoading !== null
                        }
                        onClick={() =>
                          changeOrder(parent.id, "up")
                        }
                        title="Move Up"
                        className="
                          rounded
                          bg-slate-700
                          p-2
                          text-white
                          hover:bg-cyan-600
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        <ArrowUp size={16} />
                      </button>


                      {/* DOWN */}
                      <button
                        type="button"
                        disabled={
                          isLastParent ||
                          orderLoading !== null
                        }
                        onClick={() =>
                          changeOrder(parent.id, "down")
                        }
                        title="Move Down"
                        className="
                          rounded
                          bg-slate-700
                          p-2
                          text-white
                          hover:bg-cyan-600
                          disabled:cursor-not-allowed
                          disabled:opacity-30
                        "
                      >
                        <ArrowDown size={16} />
                      </button>


                      {/* Enable / Disable */}
                      <button
                        type="button"
                        onClick={() =>
                          toggleModule(parent)
                        }
                        className="
                          rounded
                          bg-yellow-600
                          px-3
                          py-1
                          text-xs
                          text-white
                          hover:bg-yellow-500
                        "
                      >
                        {Number(parent.is_active)
                          ? "Disable"
                          : "Enable"}
                      </button>


                      {/* Edit */}
                      <button
                        type="button"
                        onClick={() =>
                          editModule(parent)
                        }
                        className="
                          rounded
                          bg-cyan-600
                          p-2
                          text-white
                          hover:bg-cyan-500
                        "
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>


                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() =>
                          deleteModule(parent.id)
                        }
                        className="
                          rounded
                          bg-red-600
                          p-2
                          text-white
                          hover:bg-red-500
                        "
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>


                      {/* Dropdown */}
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMenu(
                            openMenu === parent.id
                              ? null
                              : parent.id
                          )
                        }
                        className="
                          rounded
                          p-2
                          text-slate-300
                          hover:bg-slate-800
                        "
                      >
                        {openMenu === parent.id ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </button>

                    </div>

                  </div>


                  {/* =====================================
                      CHILD MODULES
                  ====================================== */}
                  {openMenu === parent.id && (
                    <div className="
                      space-y-2
                      border-t
                      border-slate-800
                      p-3
                    ">

                      {parent.children?.length === 0 && (
                        <p className="
                          py-3
                          text-center
                          text-xs
                          text-slate-500
                        ">
                          No child modules.
                        </p>
                      )}


                      {parent.children?.map(
                        (child, childIndex) => {

                          const ChildIcon =
                            iconMap[child.icon] ||
                            Settings;

                          const isFirstChild =
                            childIndex === 0;

                          const isLastChild =
                            childIndex ===
                            parent.children.length - 1;


                          return (
                            <div
                              key={child.id}
                              className="
                                flex
                                items-center
                                justify-between
                                gap-3
                                rounded-lg
                                bg-slate-900
                                p-3
                              "
                            >

                              <div className="
                                flex
                                min-w-0
                                items-center
                                gap-3
                              ">

                                <ChildIcon
                                  size={18}
                                  className="
                                    shrink-0
                                    text-cyan-400
                                  "
                                />

                                <div className="min-w-0">

                                  <p className="
                                    truncate
                                    text-sm
                                    font-medium
                                    text-white
                                  ">
                                    {child.label}
                                  </p>

                                  <p className="
                                    truncate
                                    text-xs
                                    text-slate-500
                                  ">
                                    {child.path}
                                  </p>

                                  <p className="
                                    text-[10px]
                                    text-slate-600
                                  ">
                                    Order: {child.sort_order}
                                  </p>

                                </div>

                              </div>


                              <div className="
                                flex
                                shrink-0
                                items-center
                                gap-2
                              ">

                                <span
                                  className={`
                                    rounded
                                    px-2
                                    py-1
                                    text-xs
                                    ${
                                      Number(child.is_active)
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                    }
                                  `}
                                >
                                  {Number(child.is_active)
                                    ? "Enabled"
                                    : "Disabled"}
                                </span>


                                {/* Child UP */}
                                <button
                                  type="button"
                                  disabled={
                                    isFirstChild ||
                                    orderLoading !== null
                                  }
                                  onClick={() =>
                                    changeOrder(
                                      child.id,
                                      "up"
                                    )
                                  }
                                  title="Move Up"
                                  className="
                                    rounded
                                    bg-slate-700
                                    p-2
                                    text-white
                                    hover:bg-cyan-600
                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                  "
                                >
                                  <ArrowUp size={15} />
                                </button>


                                {/* Child DOWN */}
                                <button
                                  type="button"
                                  disabled={
                                    isLastChild ||
                                    orderLoading !== null
                                  }
                                  onClick={() =>
                                    changeOrder(
                                      child.id,
                                      "down"
                                    )
                                  }
                                  title="Move Down"
                                  className="
                                    rounded
                                    bg-slate-700
                                    p-2
                                    text-white
                                    hover:bg-cyan-600
                                    disabled:cursor-not-allowed
                                    disabled:opacity-30
                                  "
                                >
                                  <ArrowDown size={15} />
                                </button>


                                {/* Edit */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    editModule(child)
                                  }
                                  className="
                                    rounded
                                    bg-cyan-600
                                    p-2
                                    text-white
                                    hover:bg-cyan-500
                                  "
                                  title="Edit"
                                >
                                  <Pencil size={15} />
                                </button>


                                {/* Toggle */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    toggleModule(child)
                                  }
                                  className="
                                    rounded
                                    bg-yellow-600
                                    px-3
                                    py-1
                                    text-xs
                                    text-white
                                    hover:bg-yellow-500
                                  "
                                >
                                  {Number(child.is_active)
                                    ? "Disable"
                                    : "Enable"}
                                </button>


                                {/* Delete */}
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteModule(child.id)
                                  }
                                  className="
                                    rounded
                                    bg-red-600
                                    p-2
                                    text-white
                                    hover:bg-red-500
                                  "
                                  title="Delete"
                                >
                                  <Trash2 size={15} />
                                </button>

                              </div>

                            </div>
                          );
                        }
                      )}

                    </div>
                  )}

                </div>
              );
            })}

          </div>

        </section>

      </div>


      {/* =================================================
          RIGHT ADD / EDIT MODULE
      ================================================= */}
      <div>

        <section className="
          rounded-2xl
          border
          border-slate-800
          bg-slate-900/90
          p-6
        ">

          <div className="
            mb-5
            flex
            items-center
            justify-between
          ">

            <h2 className="
              text-xl
              font-semibold
              text-white
            ">
              {isEdit
                ? "Edit Module"
                : "Add Module"}
            </h2>


            {isEdit && (
              <button
                type="button"
                onClick={resetForm}
                className="
                  text-xs
                  text-slate-400
                  hover:text-white
                "
              >
                Cancel
              </button>
            )}

          </div>


          <div className="space-y-4">

            {/* Label */}
            <input
              value={formData.label}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  label: e.target.value,
                })
              }
              placeholder="Module Label"
              className="
                w-full
                rounded-lg
                border
                border-slate-700
                bg-slate-950
                p-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            />


            {/* Path */}
            <input
              value={formData.path}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  path: e.target.value,
                })
              }
              placeholder="Module Path"
              className="
                w-full
                rounded-lg
                border
                border-slate-700
                bg-slate-950
                p-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            />


            {/* Parent */}
            <select
              value={formData.parent_id}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  parent_id: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-700
                bg-slate-950
                p-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            >

              <option value="">
                No Parent (Main Module)
              </option>

              {parentOptions.map((item) => (
                <option
                  key={item.id}
                  value={item.id}
                >
                  {item.label}
                </option>
              ))}

            </select>


            {/* Icon */}
            <select
              value={formData.icon}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  icon: e.target.value,
                })
              }
              className="
                w-full
                rounded-lg
                border
                border-slate-700
                bg-slate-950
                p-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            >

              {Object.keys(iconMap).map((icon) => (
                <option
                  key={icon}
                  value={icon}
                >
                  {icon}
                </option>
              ))}

            </select>


            {/* Sort Order */}
            <input
              type="number"
              value={formData.sort_order}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sort_order:
                    Number(e.target.value) || 0,
                })
              }
              placeholder="Sort Order"
              className="
                w-full
                rounded-lg
                border
                border-slate-700
                bg-slate-950
                p-3
                text-white
                outline-none
                focus:border-cyan-500
              "
            />


            {/* Active */}
            <label className="
              flex
              items-center
              justify-between
              rounded-lg
              bg-slate-950
              p-3
              text-white
            ">

              <span>Active</span>

              <input
                type="checkbox"
                checked={Boolean(formData.is_active)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_active: e.target.checked
                      ? 1
                      : 0,
                  })
                }
                className="h-4 w-4"
              />

            </label>


            {/* Visible */}
            <label className="
              flex
              items-center
              justify-between
              rounded-lg
              bg-slate-950
              p-3
              text-white
            ">

              <span>Visible</span>

              <input
                type="checkbox"
                checked={Boolean(formData.is_visible)}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    is_visible: e.target.checked
                      ? 1
                      : 0,
                  })
                }
                className="h-4 w-4"
              />

            </label>


            {/* Submit */}
            <button
              type="button"
              onClick={
                isEdit
                  ? updateModule
                  : addModule
              }
              className="
                w-full
                rounded-lg
                bg-cyan-500
                py-3
                font-semibold
                text-slate-950
                hover:bg-cyan-400
              "
            >
              {isEdit
                ? "Update Module"
                : "Add Module"}
            </button>

          </div>

        </section>

      </div>

    </div>
  );
};


export default Components;
