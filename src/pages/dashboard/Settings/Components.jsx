import React, { useEffect, useState } from "react";
import {toast} from 'react-hot-toast';
import DashboardShell from "../DashboardShell";
import {useAuth} from '../../../context/AuthContext';
import {BASE_URI} from '../../../config/api';
import {
  Settings,ChevronDown,UserCog,ShieldCheck,Bell,LockKeyhole,Palette,Database,
  Home,Users,User,GraduationCap,BookOpen,FileText,Calendar,BarChart3,LayoutDashboard,
  CreditCard,ShoppingCart,Package,ClipboardList,MessageSquare,Mail,Phone,Camera,Image,Video,
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
  Monitor
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
  Pencil,
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
  Monitor

};


const Components = () => {
  const {accessToken} = useAuth();
  const [modules, setModules] = useState([]);
  const [openMenu, setOpenMenu] = useState(null);
  const [formData, setFormData] = useState({
    parent_id: "",
    label: "",
    path: "",
    icon: "Settings",
    is_active: 1,
    is_visible: 1
  });
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const editModule = (module) => {

    setIsEdit(true);

    setEditId(module.id);

    setFormData({
      parent_id: module.parent_id || "",
      label: module.label,
      path: module.path,
      icon: module.icon,
      is_active: module.is_active,
      is_visible: module.is_visible
    });

  };

  const loadModules = async () => {
    try {
      const res = await fetch(`${BASE_URI}/api/dashboard/modules`,
        {
          method:"GET",
          headers:{
            authorization: `Bearer ${accessToken}`
          }
        }
      );
      const data = await res.json();
      setModules(data.data || []);
    } catch (err) {
      toast.error(err);
    }
  };
  useEffect(() => {
    loadModules();
  }, []);

  // add modules

  const addModule = async () => {

    try {
      const response = await fetch(
        `${BASE_URI}/api/dashboard/modules`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            authorization: `Bearer ${accessToken}`
          },

          body: JSON.stringify(formData)

        });
      toast.success("Module Added to Database")
      // refresh list

      const updated = await fetch(
        `${BASE_URI}/api/dashboard/modules`,
        {
          method:"GET",
          headers:{
            authorization: `Bearer ${accessToken}`
          }
        }
      );

      const data = await updated.json();
      setModules(data.data || []);
      // reset form
      setFormData({
        parent_id: "",
        label: "",
        path: "",
        icon: "Settings",
        is_active: 1,
        is_visible: 1
      });


    }
    catch (error) {

      console.log(error);

    }

  };


  // Edit modules


  const updateModule = async () => {

    await fetch(
      `${BASE_URI}/api/dashboard/modules/${editId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization :`Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      }
    );
    toast.success("Module Updated");
    await loadModules();
    setIsEdit(false);
    setEditId(null);

    setFormData({
      parent_id: "",
      label: "",
      path: "",
      icon: "Settings",
      is_active: 1,
      is_visible: 1
    });

  };
  //Delete Modules
  const deleteModule = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this module?"
    );

    if (!confirmDelete) return;


    await fetch(
      `${BASE_URI}/api/dashboard/modules/${id}`,
      {
        method: "DELETE",
        headers:{
          authorization:`Bearer ${accessToken}`
        }
      }
    );
    toast.success("Module Deleted From Database")
    loadModules();

  };
  // trogle modules

  const toggleModule = async (module) => {

    await fetch(
      `${BASE_URI}/api/dashboard/modules/${module.id}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          authorization :`Bearer ${accessToken}`
        },
        body: JSON.stringify({
          is_active: module.is_active ? 0 : 1
        })
      }
    );

    loadModules();

  };

  return (

    <DashboardShell title="Module Settings">

      <div className="grid gap-2 lg:grid-cols-3">

        {/* LEFT MODULE LIST */}
        <div className="lg:col-span-2">

          <section className="
      rounded-2xl
      border
      border-slate-800
      bg-slate-900/90
      p-6
    ">

            <h2 className="mb-5 text-xl font-semibold text-white">
              Dashboard Modules
            </h2>


            <div className="space-y-2">

              {modules.map((parent) => {

                const ParentIcon =
                  iconMap[parent.icon] || Settings;


                return (

                  <div
                    key={parent.id}
                    className="
              rounded-xl
              border
              border-slate-800
              bg-slate-950/70
              overflow-hidden
            "
                  >


                    <div
                      className="flex w-full justify-between items-center p-2   hover:bg-slate-900"

                    >


                      <div className="flex gap-3 items-center">

                        <ParentIcon
                          className="text-cyan-400"
                          size={22}
                        />


                        <div>
                          <h3 className="text-white font-semibold">
                            {parent.label}
                          </h3>

                          <p className="text-xs text-slate-400">
                            {parent.path}
                          </p>
                        </div>

                      </div>

                      <div className="flex items-center gap-6">

                        {/* Status */}
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${parent.is_active
                              ? "bg-green-600 text-white"
                              : "bg-red-600 text-white"
                            }`}
                        >
                          {parent.is_active ? "Enabled" : "Disabled"}
                        </span>

                        {/* Enable / Disable */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleModule(parent);
                          }}
                          className="px-3 py-1 rounded bg-yellow-600 text-white text-xs hover:bg-yellow-500"
                        >
                          {parent.is_active ? "Disable" : "Enable"}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            editModule(parent);
                          }}
                          className="px-3 py-1 rounded bg-cyan-600 text-white text-xs hover:bg-cyan-500"
                        >
                           <Pencil size={18} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModule(parent.id);
                          }}
                          className="
px-3 py-1
rounded
bg-red-600
text-white
text-xs
hover:bg-red-500
"
                        >
                          Delete
                        </button>

                        {/* Dropdown Icon */}
                        <ChevronDown
                          size={20}
                          onClick={() =>
                            setOpenMenu(
                              openMenu === parent.id ? null : parent.id
                            )
                          }
                          className={`cursor-pointer transition ${openMenu === parent.id ? "rotate-180" : ""
                            }`}
                        />
                      </div>

                    </div>



                    {
                      openMenu === parent.id &&

                      <div className="
            border-t
            border-slate-800
            p-3
            space-y-2
          ">
                        {
                          parent.children?.map((child) => {

                            const ChildIcon = iconMap[child.icon] || Settings;

                            return (

                              <div
                                key={child.id}
                                className="
        flex
        items-center
        justify-between
        rounded-lg
        bg-slate-900
        p-3
      "
                              >

                                <div className="flex items-center gap-3">

                                  <ChildIcon
                                    size={18}
                                    className="text-cyan-400"
                                  />

                                  <div>

                                    <p className="text-white text-sm font-medium">
                                      {child.label}
                                    </p>

                                    <p className="text-xs text-slate-500">
                                      {child.path}
                                    </p>

                                  </div>

                                </div>

                                <div className="flex items-center gap-2">

                                  <span
                                    className={`px-2 py-1 rounded text-xs ${child.is_active
                                        ? "bg-green-600 text-white"
                                        : "bg-red-600 text-white"
                                      }`}
                                  >
                                    {child.is_active ? "Enabled" : "Disabled"}
                                  </span>

                                  <button
                                    onClick={() => editModule(child)}
                                    className="px-3 py-1 rounded bg-cyan-600 text-white text-xs hover:bg-cyan-500"
                                  >
                                    Edit
                                  </button>



                                  <button
                                    onClick={() => toggleModule(child)}
                                    className="px-3 py-1 rounded bg-yellow-600 text-white text-xs hover:bg-yellow-500"
                                  >
                                    {child.is_active ? "Disable" : "Enable"}
                                  </button>

                                  <button
                                    onClick={() => {
                                      deleteModule(child.id);
                                    }}
                                    className="
px-3 py-1
rounded
bg-red-600
text-white
text-xs
"
                                  >
                                    Delete
                                  </button>
                                </div>

                              </div>

                            );

                          })
                        }


                      </div>

                    }


                  </div>

                )

              })}

            </div>


          </section>


        </div>

        {/* RIGHT ADD MODULE */}
        <div>
           <section className="
                          rounded-2xl
                          border
                          border-slate-800
                          bg-slate-900/90
                          p-6
                        ">
            <h2 className="text-xl font-semibold text-white mb-5">
              Add Module
            </h2>



            <div className="space-y-4">


              <input
                value={formData.label}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    label: e.target.value
                  })
                }
                placeholder="Module Label"
                className="
  w-full rounded-lg
  bg-slate-950
  border border-slate-700 p-3 text-white
  "
              />

              <input

                value={formData.path}

                onChange={(e) =>
                  setFormData({
                    ...formData,
                    path: e.target.value
                  })
                }

                placeholder="Module Path"

                className="
                    w-full rounded-lg bg-slate-950 border border-slate-700p-3 text-white
                    "
              />
              <select
                value={formData.parent_id}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    parent_id: e.target.value
                  })
                }
                className="
                w-full rounded-lg
                bg-slate-950 border border-slate-700 p-3 text-white"
                              >
                <option value="">
                  No Parent (Main Module)
                </option>


                {
                  modules.map(item => (

                    <option
                      key={item.id}
                      value={item.id}
                    >

                      {item.label}

                    </option>

                  ))}
              </select>

              <select
                value={formData.icon}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    icon: e.target.value
                  })
                }
                className="w-full rounded-lg bg-slate-950 border border-slate-700 p-3 text-white"
              >

                {
                  Object.keys(iconMap).map((icon) => (

                    <option
                      key={icon}
                      value={icon}
                    >
                      {icon}
                    </option>

                  ))
                }

              </select>





              <label className="
    flex
    justify-between
    text-white
    bg-slate-950
    p-3
    rounded-lg
  ">

                Active
                <input

                  type="checkbox"

                  checked={formData.is_active}

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_active: e.target.checked ? 1 : 0
                    })
                  }

                />

              </label>




              <label className="
    flex
    justify-between
    text-white
    bg-slate-950
    p-3
    rounded-lg
  ">

                Visible

                <input

                  type="checkbox"

                  checked={formData.is_visible}

                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      is_visible: e.target.checked ? 1 : 0
                    })
                  }

                />
              </label>




              <button
                onClick={isEdit ? updateModule : addModule}
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
                {isEdit ? "Update Module" : "Add Module"}
              </button>



            </div>


          </section>


        </div>


      </div>
    </DashboardShell>

  );
};


export default Components;