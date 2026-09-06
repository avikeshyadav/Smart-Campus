import React, { useEffect, useRef, useState } from "react";

// // const [userInfo,setUserInfo] = useEffect("")
//   useEffect(() => {
//     const getCookie = (name) => {
//       const value = `; ${document.cookie}`;
//       const parts = value.split(`; ${name}=`);
//       if (parts.length === 2) {
//         return parts.pop().split(";").shift();
//       }
//       return null;
//     };

//   //   const userCookie = getCookie("auth_user");
//   //   if (userCookie) {
//   //     try {
//   //       const userData = JSON.parse(decodeURIComponent(userCookie));
//   //       // setUserInfo(userData);
//   //       console.log("User from cookie:", userData);
//   //     } catch (e) {
//   //       console.error("Invalid user cookie", e);
//   //     }
//   //   }
//   }, []);


const UserSection = () => {
  return (
    <div>
    <section className="rounded-xl border border-slate-800 bg-slate-900/90 p-3">
          <h2 className="text-2xl font-semibold text-white">Profile Details</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Name</p>
              <p className="mt-2 font-semibold text-white">Admin User</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Email</p>
              <p className="mt-2 font-semibold text-white">avikesh@admin.com</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Role</p>
              <p className="mt-2 font-semibold text-white">Security Admin</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Status</p>
              <p className="mt-2 font-semibold text-cyan-400">Active</p>
            </div>
          </div>
        </section>
    </div>
  )
}

export default UserSection;