import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Notifications from "./components/Notifications";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

import {
  Search,
  User,
  Users,
  Settings,
  LogOut,
  KeyRound,
  ChevronDown,
} from "lucide-react";

const Topbar = ({ title = "Dashboard" }) => {
  const { user, logout, accessToken } = useAuth();
  const dropdownRef = useRef(null);
  const searchRef = useRef(null);
  const [openProfile, setOpenProfile] = useState(false);
  // =====================================================
  // SEARCH STATES
  // =====================================================
  const [search, setSearch] = useState("");
  const [students, setStudents] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const getStudentImage = (photoPath) => {
  if (!photoPath) return null;
  const normalizedPath = photoPath.replace(/\\/g, "/");
  if (normalizedPath.startsWith("http")) {
    return normalizedPath;
  }
  return `http://localhost:5001/${normalizedPath}`;
};


  // =====================================================
  // CLOSE PROFILE DROPDOWN OUTSIDE CLICK
  // =====================================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setOpenProfile(false);
      }

      if (
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setShowSearchResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // SEARCH STUDENTS
  // =====================================================
  useEffect(() => {
    if (!accessToken) return;

    const searchValue = search.trim();

    // Empty search
    if (!searchValue) {
      setStudents([]);
      setShowSearchResults(false);
      return;
    }

    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        setShowSearchResults(true);
        const response = await fetch(
          `${BASE_URI}/api/students/search?q=${encodeURIComponent(
            searchValue
          )}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
            signal: controller.signal,
          }
        );
        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          );
        }

        const data = await response.json();

        setStudents(data?.students || []);
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Student search error:", error);
          setStudents([]);
        }
      } finally {
        setSearchLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [search, accessToken]);

  // =====================================================
  // CLEAR SEARCH
  // =====================================================
  const clearSearch = () => {
    setSearch("");
    setStudents([]);
    setShowSearchResults(false);
  };

  // const image =
  //   student?.image ||
  //   null;

  // const imageUrl = image
  //   ? image.startsWith("http")
  //     ? image
  //     : `${baseUri}${image}`
  //   : null;

  return (
    <header
      className="
        fixed
        left-[260px]
        right-0
        top-0
        z-40
        flex
        h-[72px]
        items-center
        justify-between
        border-b
        border-slate-800
        bg-slate-950/95
        px-6
        py-2
        backdrop-blur-xl
      "
    >
      {/* =====================================================
          LEFT SECTION
      ===================================================== */}

      <div>
        <p
          className="
            relative
            hidden
            w-80
            text-xs
            uppercase
            tracking-[0.3em]
            text-cyan-400
            md:flex
          "
        >
          Facial Recognition Console
        </p>

        <h1
          className="
            relative
            mt-1
            hidden
            w-80
            text-xl
            font-bold
            text-white
            md:flex
          "
        >
          {title}
        </h1>
      </div>

      {/* =====================================================
          SEARCH SECTION
      ===================================================== */}

      <div
        ref={searchRef}
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
            z-10
            text-slate-500
          "
        />

        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setShowSearchResults(true);
          }}
          onFocus={() => {
            if (search.trim()) {
              setShowSearchResults(true);
            }
          }}
          placeholder="Search students..."
          className="
            w-full
            rounded-xl
            border
            border-slate-700
            bg-slate-900
            py-2.5
            pl-10
            pr-3
            text-sm
            text-white
            outline-none
            placeholder:text-slate-500
            focus:border-cyan-500
          "
        />

        {/* =====================================================
            SEARCH RESULTS DROPDOWN
        ===================================================== */}

        {showSearchResults && search.trim() && (
          <div
            className="
              absolute
              left-0
              right-0
              top-14
              max-h-80
              overflow-y-auto
              rounded-xl
              border
              border-slate-700
              bg-slate-950
              shadow-2xl
            "
          >
            {/* Loading */}
            {searchLoading && (
              <div className="px-4 py-4 text-center text-sm text-slate-400">
                Searching students...
              </div>
            )}

            {/* Results */}
            {!searchLoading &&
              students.length > 0 && (
                <div className="p-2">
                  {students.map((student) => (
                    <Link
                      key={student.id}
                      to={`/dashboard/students/${student.id}`}
                      onClick={clearSearch}
                      className="
                        flex
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-2.5
                        transition
                        hover:bg-slate-900
                      "
                    >
                      {/* Student Avatar */}
                      <div
                          className="
                            flex
                            h-9
                            w-9
                            shrink-0
                            items-center
                            justify-center
                            overflow-hidden
                            rounded-full
                            bg-cyan-500/10
                          "
                        >
                          {student.photo_path ? (
                            <img
                              src={getStudentImage(student.photo_path)}
                              alt={student.name || "Student"}
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = "";
                              }}
                            />
                          ) : (
                            <span className="text-sm font-bold text-cyan-400">
                              {student.name?.charAt(0)?.toUpperCase() || "S"}
                            </span>
                          )}
                        </div>


                      {/* Student Details */}
                      <div className="min-w-0 flex-1">
                        <p
                          className="
                            truncate
                            text-sm
                            font-medium
                            text-white
                          "
                        >
                          {student.name}
                        </p>

                        <p
                          className="
                            truncate
                            text-xs
                            text-slate-500
                          "
                        >
                          {student.student_id}
                          {student.email
                            ? ` • ${student.email}`
                            : ""}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

            {/* No Results */}
            {!searchLoading &&
              students.length === 0 && (
                <div className="px-4 py-5 text-center">
                  <p className="text-sm text-slate-400">
                    No students found
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Try name, roll number or email
                  </p>
                </div>
              )}
          </div>
        )}
      </div>

      {/* =====================================================
          RIGHT SECTION
      ===================================================== */}

      <div className="flex items-center gap-3">
        <Notifications />

        {/* =====================================================
            USER PROFILE
        ===================================================== */}

        <div
          ref={dropdownRef}
          className="relative"
        >
          <button
            onClick={() =>
              setOpenProfile(!openProfile)
            }
            className="
              flex
              items-center
              gap-3
              rounded-xl
              border
              border-slate-700
              bg-slate-900
              px-3
              py-2
              transition
              hover:border-cyan-500
            "
          >
            <img
              src={user?.avatar_url || ""}
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
                {user?.name}
              </p>

              <p
                className="
                  text-xs
                  text-slate-400
                "
              >
                {user?.role}
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

          {/* =====================================================
              PROFILE DROPDOWN
          ===================================================== */}

          {openProfile && (
            <div
              className="
                absolute
                right-0
                mt-3
                w-64
                rounded-xl
                border
                border-slate-700
                bg-slate-950
                p-2
                shadow-2xl
              "
            >
              <Link
                to="/dashboard/profile"
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
                to="/dashboard/profile"
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

              <hr className="my-2 border-slate-800" />

              <button
                onClick={logout}
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
