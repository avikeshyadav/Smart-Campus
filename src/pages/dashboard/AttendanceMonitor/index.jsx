import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";

import PageHeader from "./components/PageHeader";
import StatsGrid from "./components/StatsGrid";
import LiveAttendanceCard from "./components/LiveAttendanceCard";
import AttendanceListCard from "./components/AttendanceListCard";
import SystemStatusFooter from "./components/SystemStatusFooter";

const BASE_URI = "/py-api";

const ATTENDANCE_URL =
  `${BASE_URI}/api/attendance/today`;

const ITEMS_PER_PAGE = 8;

export default function AttendanceMonitor() {
  const { accessToken } = useAuth();

  const [attendance, setAttendance] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [databaseOnline, setDatabaseOnline] =
    useState(false);

  const [search, setSearch] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastUpdated, setLastUpdated] =
    useState(null);

  // =========================================================
  // GET TODAY'S FULL ATTENDANCE
  // Only used on initial load / refresh
  // =========================================================

  const fetchAttendance = useCallback(
    async () => {
      setLoading(true);

      try {
        const response = await fetch(
          ATTENDANCE_URL,
          {
            method: "GET",

            headers: accessToken
              ? {
                  Authorization:
                    `Bearer ${accessToken}`,
                }
              : {},
          }
        );

        if (!response.ok) {
          throw new Error(
            `Server error: ${response.status}`
          );
        }

        const data =
          await response.json();

        const list =
          Array.isArray(data)
            ? data
            : Array.isArray(data?.data)
            ? data.data
            : [];

        setAttendance(list);

        setDatabaseOnline(true);

        setLastUpdated(
          new Date()
        );

      } catch (error) {
        console.error(
          "Attendance fetch:",
          error
        );

        setDatabaseOnline(false);

        toast.error(
          "Database connection failed"
        );

      } finally {
        setLoading(false);
      }
    },
    [accessToken]
  );

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    fetchAttendance();
  }, [fetchAttendance]);

  // =========================================================
  // LIVE STUDENT UPDATE
  //
  // Camera se sirf ek student aata hai.
  // Full attendance API call nahi hoti.
  // =========================================================

  const handleAttendanceDetected =
    useCallback((student) => {
      if (!student?.student_id) {
        return;
      }

      const studentId =
        String(student.student_id);

      setAttendance((current) => {
        const existingIndex =
          current.findIndex(
            (item) =>
              String(
                item?.student_id
              ) === studentId
          );

        // ---------------------------------------------------
        // EXISTING STUDENT
        // ---------------------------------------------------

        if (existingIndex !== -1) {
          const updated = [
            ...current,
          ];

          updated[existingIndex] = {
            ...updated[existingIndex],
            ...student,

            // Keep existing attendance ID
            id:
              updated[existingIndex].id,
          };

          return updated;
        }

        // ---------------------------------------------------
        // NEW STUDENT
        // ---------------------------------------------------

        return [
          student,
          ...current,
        ];
      });

      setLastUpdated(
        new Date()
      );
    }, []);

  // =========================================================
  // NORMALIZE
  // =========================================================

  const normalized =
    useMemo(() => {
      return attendance.map(
        (item, index) => ({
          ...item,

          id:
            item?.id ??
            item?.attendance_id ??
            `${item?.student_id}-${index}`,

          studentId:
            item?.student_id ??
            "—",

          name:
            item?.name ??
            "Unknown Student",

          className:
            item?.class ??
            item?.course ??
            "—",

          time:
            item?.time ??
            item?.marked_at ??
            null,

          status:
            item?.status ??
            "Present",

          confidence:
            item?.confidence ??
            null,

          image:
            item?.image ??
            null,
        })
      );
    }, [attendance]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filtered =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return normalized;
      }

      return normalized.filter(
        (item) =>
          String(item.name)
            .toLowerCase()
            .includes(query) ||

          String(item.studentId)
            .toLowerCase()
            .includes(query) ||

          String(item.className)
            .toLowerCase()
            .includes(query)
      );
    }, [
      normalized,
      search,
    ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filtered.length /
          ITEMS_PER_PAGE
      )
    );

  const paginated =
    filtered.slice(
      (page - 1) *
        ITEMS_PER_PAGE,

      page *
        ITEMS_PER_PAGE
    );

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const stats =
    useMemo(() => {
      const present =
        normalized.filter(
          (item) =>
            String(
              item.status
            ).toLowerCase() ===
              "present" ||
            String(
              item.status
            ).toLowerCase() ===
              "already present"
        ).length;

      const late =
        normalized.filter(
          (item) =>
            String(
              item.status
            ).toLowerCase() ===
            "late"
        ).length;

      const uniqueStudents =
        new Set(
          normalized.map(
            (item) =>
              item.studentId
          )
        ).size;

      return {
        total:
          normalized.length,

        present,

        late,

        uniqueStudents,
      };
    }, [normalized]);

  // =========================================================
  // LAST UPDATED
  // =========================================================

  const updatedText =
    lastUpdated
      ? lastUpdated.toLocaleTimeString(
          [],
          {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
          }
        )
      : "Waiting";

  // =========================================================
  // UI
  // =========================================================

  return (
    <>

      <div className="min-h-screen bg-slate-950 text-slate-200">

        <PageHeader
          monitorOnline={
            databaseOnline
          }
          lastUpdated={
            updatedText
          }
          onRefresh={
            fetchAttendance
          }
          loading={
            loading
          }
        />

        <StatsGrid
          total={
            stats.total
          }
          present={
            stats.present
          }
          late={
            stats.late
          }
          uniqueStudents={
            stats.uniqueStudents
          }
        />

        <div className="grid gap-3 xl:grid-cols-[1.6fr_1fr]">

          <LiveAttendanceCard
            baseUri={
              BASE_URI
            }
            accessToken={
              accessToken
            }
            databaseOnline={
              databaseOnline
            }
            onAttendanceDetected={
              handleAttendanceDetected
            }
          />

          <AttendanceListCard
            filteredAttendance={
              filtered
            }
            paginatedAttendance={
              paginated
            }
            search={
              search
            }
            setSearch={
              setSearch
            }
            loading={
              loading
            }
            refreshAttendance={
              fetchAttendance
            }
            currentPage={
              page
            }
            totalPages={
              totalPages
            }
            setCurrentPage={
              setPage
            }
            baseUri={
              BASE_URI
            }
          />

        </div>

        <SystemStatusFooter
          monitorOnline={
            databaseOnline
          }
          total={
            stats.total
          }
          lastUpdated={
            updatedText
          }
        />

      </div>

    </>
  );
}
