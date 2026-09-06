import React, { useEffect, useState } from "react";
import { Check, X, RefreshCw, ArrowRightLeft } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import { BASE_URI } from "../../../config/api";

export default function RoomChanges() {
  const { accessToken } = useAuth();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);

  const fetchRoomChanges = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BASE_URI}/api/hostel/room-changes`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch room changes");
      }

      const list =
        data?.roomChanges ||
        data?.requests ||
        data?.data ||
        [];

      setRows(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error("ROOM CHANGE FETCH ERROR:", error);
      toast.error(error.message || "Failed to load room change requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchRoomChanges();
    }
  }, [accessToken]);

  const processRequest = async (id, status) => {
    try {
      setProcessingId(id);

      const res = await fetch(
        `${BASE_URI}/api/hostel/room-changes/${id}/process`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || `Failed to ${status.toLowerCase()} request`
        );
      }

      toast.success(
        status === "Approved"
          ? "Room change request approved"
          : "Room change request rejected"
      );

      // Fresh data from backend
      await fetchRoomChanges();
    } catch (error) {
      console.error("ROOM CHANGE PROCESS ERROR:", error);
      toast.error(error.message || "Failed to process request");
    } finally {
      setProcessingId(null);
    }
  };

  const getId = (row) =>
    row.id ||
    row.request_id ||
    row.requestId;

  const getStudent = (row) =>
    row.student ||
    row.student_name ||
    row.name ||
    row.studentName ||
    "Unknown Student";

  const getCurrentRoom = (row) =>
    row.from ||
    row.current_room ||
    row.currentRoom ||
    row.from_room ||
    "-";

  const getRequestedRoom = (row) =>
    row.to ||
    row.requested_room ||
    row.requestedRoom ||
    row.to_room ||
    "-";

  const getReason = (row) =>
    row.reason ||
    row.change_reason ||
    "-";

  const getDate = (row) =>
    row.date ||
    row.created_at ||
    row.createdAt ||
    "-";

  const getStatus = (row) => {
    const status = row.status || "Pending";

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1).toLowerCase()
    );
  };

  const statusClass = (status) => {
    if (status === "Approved") {
      return "bg-emerald-500/15 text-emerald-400";
    }

    if (status === "Rejected") {
      return "bg-red-500/15 text-red-400";
    }

    return "bg-amber-500/15 text-amber-400";
  };

  return (
    <section className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400">
              <ArrowRightLeft size={22} />
            </div>

            <h2 className="text-2xl font-bold">
              Room Change Requests
            </h2>
          </div>

          <p className="text-slate-500 text-sm mt-1">
            Approve or reject resident room transfer requests.
          </p>
        </div>

        <button
          onClick={fetchRoomChanges}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-700 bg-[#071022] hover:bg-[#0b1529] transition"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Table */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-[#071022] overflow-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-[#0b1529] text-slate-500">
            <tr>
              {[
                "Request",
                "Student",
                "Current",
                "Requested",
                "Reason",
                "Date",
                "Status",
                "Action",
              ].map((x) => (
                <th
                  className="text-left p-4 whitespace-nowrap"
                  key={x}
                >
                  {x}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {/* Loading */}
            {loading ? (
              <tr>
                <td
                  colSpan="8"
                  className="p-10 text-center text-slate-500"
                >
                  Loading room change requests...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              /* Empty */
              <tr>
                <td
                  colSpan="8"
                  className="p-10 text-center"
                >
                  <div className="flex flex-col items-center justify-center">
                    <ArrowRightLeft
                      size={35}
                      className="text-slate-600 mb-3"
                    />

                    <p className="text-slate-400">
                      No room change requests found
                    </p>

                    <p className="text-xs text-slate-600 mt-1">
                      New requests will appear here.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const id = getId(row);
                const status = getStatus(row);

                return (
                  <tr
                    key={id}
                    className="border-t border-slate-800 hover:bg-white/[0.02]"
                  >
                    {/* Request ID */}
                    <td className="p-4 text-cyan-300 font-medium">
                      {row.request_code ||
                        row.requestCode ||
                        `RC-${String(id).padStart(3, "0")}`}
                    </td>

                    {/* Student */}
                    <td className="p-4 font-semibold">
                      {getStudent(row)}
                    </td>

                    {/* Current */}
                    <td className="p-4">
                      {getCurrentRoom(row)}
                    </td>

                    {/* Requested */}
                    <td className="p-4">
                      {getRequestedRoom(row)}
                    </td>

                    {/* Reason */}
                    <td className="p-4 text-slate-400">
                      {getReason(row)}
                    </td>

                    {/* Date */}
                    <td className="p-4 text-slate-400 whitespace-nowrap">
                      {getDate(row)}
                    </td>

                    {/* Status */}
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 rounded text-xs ${statusClass(
                          status
                        )}`}
                      >
                        {status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="p-4">
                      {status === "Pending" ? (
                        <div className="flex gap-2">
                          {/* Approve */}
                          <button
                            onClick={() =>
                              processRequest(id, "Approved")
                            }
                            disabled={processingId === id}
                            title="Approve"
                            className="p-2 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {processingId === id ? (
                              <RefreshCw
                                size={16}
                                className="animate-spin"
                              />
                            ) : (
                              <Check size={16} />
                            )}
                          </button>

                          {/* Reject */}
                          <button
                            onClick={() =>
                              processRequest(id, "Rejected")
                            }
                            disabled={processingId === id}
                            title="Reject"
                            className="p-2 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">
                          No action
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}