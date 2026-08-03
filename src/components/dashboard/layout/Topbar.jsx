import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Bell,
  Search,
  User,
  Users,
  Settings,
  LogOut,
  KeyRound,
  ChevronDown,
} from "lucide-react";


const Topbar = ({ title = "Dashboard", onLogout }) => {

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [openProfile, setOpenProfile] = useState(false);

  const [user, setUser] = useState({
    name: "Admin User",
    role: "Super Admin",
    avatar: "https://i.pravatar.cc/150?img=12",
  });


  // Fetch User From Backend API
  useEffect(() => {

    const getUser = async () => {

      try {

        const response = await fetch(
          "http://localhost:5000/api/auth/profile",
          {
            credentials: "include",
          }
        );


        if (response.ok) {

          const data = await response.json();


          setUser({
            name: data.name,
            role: data.role,
            avatar:
              data.profileImage ||
              "https://i.pravatar.cc/150",
          });

        }


      } catch (error) {

        console.log("User fetch error:", error);

      }

    };


    getUser();

  }, []);




  // Close Dropdown Outside Click
  useEffect(() => {

    const handleClickOutside = (event) => {

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {

        setOpenProfile(false);

      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };


  }, []);





  const handleLogout = () => {

    if (onLogout) {

      onLogout();

      return;

    }


    document.cookie =
      "auth_user=; path=/; max-age=0";


    navigate("/login");

  };





  return (

    <header
      className="
        sticky top-0 z-40
        flex items-center justify-between
        border-b border-slate-800
        bg-slate-950/95
        px-6 py-4
        backdrop-blur
      "
    >


      {/* LEFT SECTION */}

      <div>

        <p
          className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-cyan-400
          "
        >
          Facial Recognition Console
        </p>


        <h1
          className="
            mt-1
            text-xl
            font-bold
            text-white
          "
        >
          {title}
        </h1>

      </div>





      {/* SEARCH SECTION */}

      <div
        className="
          relative
          hidden
          w-80
          md:flex
        "
      >

        <Search
          size={18}
          className="
            absolute
            left-3
            top-3
            text-slate-500
          "
        />


        <input
          type="text"
          placeholder="Search students..."
          className="
            w-full
            rounded-xl
            border border-slate-700
            bg-slate-900
            py-2.5
            pl-10
            text-sm
            text-white
            outline-none
            focus:border-cyan-500
          "
        />

      </div>






      {/* RIGHT SECTION */}

      <div
        className="
          flex
          items-center
          gap-3
        "
      >


        {/* Notification */}

        <button
          className="
            relative
            rounded-xl
            border border-slate-700
            p-2.5
            text-slate-300
            transition
            hover:border-cyan-500
            hover:text-cyan-400
          "
        >

          <Bell size={20} />


          <span
            className="
              absolute
              -right-1
              -top-1
              flex
              h-5
              w-5
              items-center
              justify-center
              rounded-full
              bg-rose-500
              text-[10px]
              text-white
            "
          >
            3
          </span>


        </button>







        {/* USER PROFILE */}

        <div
          ref={dropdownRef}
          className="relative"
        >


          <button
            onClick={() => setOpenProfile(!openProfile)}
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border border-slate-700
              bg-slate-900
              px-3
              py-2
              transition
              hover:border-cyan-500
            "
          >


            <img
              src={user.avatar}
              alt="profile"
              className="
                h-10
                w-10
                rounded-full
                object-cover
              "
            />


            <div
              className="
                hidden
                text-left
                sm:block
              "
            >

              <p
                className="
                  text-sm
                  font-semibold
                  text-white
                "
              >
                {user.name}
              </p>


              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                {user.role}
              </p>


            </div>



            <ChevronDown
              size={18}
              className={`
                text-slate-400
                transition
                ${
                  openProfile
                    ? "rotate-180"
                    : ""
                }
              `}
            />


          </button>






          {/* DROPDOWN MENU */}

          {openProfile && (

            <div
              className="
                absolute
                right-0
                mt-3
                w-64
                rounded-xl
                border border-slate-700
                bg-slate-950
                p-2
                shadow-2xl
              "
            >


              <Link
                to="/profile"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-slate-300
                  hover:bg-slate-900
                  hover:text-cyan-400
                "
              >

                <User size={17} />

                My Profile

              </Link>




              <Link
                to="/dashboard/users"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-slate-300
                  hover:bg-slate-900
                  hover:text-cyan-400
                "
              >

                <Users size={17} />

                Manage Users

              </Link>





              <Link
                to="/dashboard/settings"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-slate-300
                  hover:bg-slate-900
                  hover:text-cyan-400
                "
              >

                <Settings size={17} />

                Settings

              </Link>





              <Link
                to="/change-password"
                className="
                  flex
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-slate-300
                  hover:bg-slate-900
                  hover:text-cyan-400
                "
              >

                <KeyRound size={17} />

                Change Password

              </Link>





              <hr
                className="
                  my-2
                  border-slate-800
                "
              />





              <button
                onClick={handleLogout}
                className="
                  flex
                  w-full
                  items-center
                  gap-3
                  rounded-lg
                  px-3
                  py-2
                  text-sm
                  text-rose-400
                  hover:bg-rose-500/10
                "
              >

                <LogOut size={17} />

                Logout

              </button>



            </div>

          )}



        </div>


      </div>


    </header>

  );

};


export default Topbar;