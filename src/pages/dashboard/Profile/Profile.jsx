import React, { use, useState } from "react";
import { User, Mail, Shield, Calendar, Edit3, Lock, LogOut } from "lucide-react";
import DashboardShell from "../DashboardShell";
import { useAuth } from "../../../context/AuthContext";
const ProfilePage = () => {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  console.log(user)

  const [profile, setProfile] = useState({

    name: user?.name || "Admin User",
    email: user?.email || "admin@example.com",
    role: user?.role || "Administrator",
    last_login:user.last_login || "NOT found",
    image: user.dp || "No Dp Found"
  });



  return (
    <DashboardShell title="Profile">

      <div className="min-h-screen bg-slate-950 p-6 text-white">

{/* Header */}
<div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-lg">

  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

    {/* User Info */}
    <div className="flex items-center gap-5">

      {/* Avatar */}
      <div className="flex h-24 w-24 items-center justify-center rounded-full 
                      bg-gradient-to-br from-cyan-400 to-blue-600 
                      text-4xl font-bold text-white shadow-lg">

        {profile?.name?.charAt(0).toUpperCase()}
      </div>


      {/* Details */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          {profile.name}
        </h1>

        <div className="mt-2 flex items-center gap-2">
          <span className="rounded-full bg-cyan-500/20 px-3 py-1 
                           text-xs font-medium text-cyan-400">
            {profile.role}
          </span>
        </div>

        <p className="mt-2 text-sm text-slate-400">
          Welcome back, {profile.name}
        </p>
      </div>

    </div>


    {/* Login Info */}
    <div className="rounded-xl border border-slate-700 
                    bg-slate-800/50 px-5 py-4">

      <p className="text-xs uppercase tracking-wider text-slate-400">
        Last Login
      </p>

      <p className="mt-1 text-lg font-semibold text-cyan-400">
        {user?.last_login
          ? new Date(user.last_login).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })
          : "Never"}
      </p>

    </div>

  </div>

</div>

        <div className="grid gap-6 md:grid-cols-3">


          {/* Profile Card */}
          <div className="md:col-span-2 rounded-xl border border-slate-800 bg-slate-900 p-6">


            <div className="mb-5 flex justify-between">

              <h2 className="text-xl font-semibold">
                Personal Information
              </h2>


              <button
                onClick={() => setEditing(!editing)}
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm text-white"
              >
                <Edit3 size={16}/>
                {editing ? "Save" : "Edit"}
              </button>

            </div>



            <div className="space-y-5">


              <ProfileField
                icon={<User />}
                label="Full Name"
                value={profile.name}
                disabled={!editing}
                onChange={(e)=>
                  setProfile({...profile,name:e.target.value})
                }
              />



              <ProfileField
                icon={<Mail />}
                label="Email"
                value={profile.email}
                disabled={!editing}
                onChange={(e)=>
                  setProfile({...profile,email:e.target.value})
                }
              />



              <ProfileField
                icon={<Shield />}
                label="Role"
                value={profile.role}
                disabled
              />



            </div>


          </div>



          {/* Actions */}
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6">

            <h2 className="mb-5 text-xl font-semibold">
              Account
            </h2>


            <button
              className="mb-3 flex w-full items-center gap-3 rounded-lg border border-slate-700 px-4 py-3 hover:bg-slate-800"
            >
              <Lock size={18}/>
              Change Password
            </button>



            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg bg-red-500 px-4 py-3"
            >
              <LogOut size={18}/>
              Logout
            </button>


          </div>


        </div>



        {/* Account Details */}

        <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-6">


          <h2 className="mb-5 text-xl font-semibold">
            Account Details
          </h2>


          <div className="grid gap-5 md:grid-cols-3">


            <InfoCard
              icon={<Calendar/>}
              title="Joined"
              value="January 2026"
            />


            <InfoCard
              icon={<Shield/>}
              title="Status"
              value="Active"
            />


            <InfoCard
              icon={<User/>}
              title="Account Type"
              value= {profile.role}
            />


          </div>


        </div>



      </div>

    </DashboardShell>
  );
};



const ProfileField = ({
  icon,
  label,
  value,
  disabled,
  onChange
})=>(
<div>

<label className="mb-2 block text-sm text-slate-400">
{label}
</label>


<div className="flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">

<span className="text-cyan-400">
{icon}
</span>


<input
value={value}
disabled={disabled}
onChange={onChange}
className="w-full bg-transparent outline-none disabled:text-slate-400"
/>

</div>

</div>
);



const InfoCard = ({icon,title,value})=>(
<div className="flex items-center gap-4 rounded-lg bg-slate-800 p-4">

<div className="text-cyan-400">
{icon}
</div>

<div>
<p className="text-sm text-slate-400">
{title}
</p>

<p className="font-semibold">
{value}
</p>

</div>

</div>
);



export default ProfilePage;