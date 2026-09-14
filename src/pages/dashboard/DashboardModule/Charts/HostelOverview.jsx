import React from "react";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const HostelOverview = ({ summary}) => {

  const occupancyPercentage =
    summary.totalBeds > 0
      ? Math.round((summary.occupiedBeds / summary.totalBeds) * 100)
      : 0;

  const chartData = {
    labels: ["Available Beds", "Occupied Beds"],
    datasets: [
      {
        data: [summary?.availableBeds, summary?.availableBeds],
        backgroundColor: [
          "#22c55e",
          "#3b82f6",
        ],
        borderColor: ["#16a34a", "#2563eb"],
        borderWidth: 2,
        hoverOffset: 8,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 13,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return ` ${context.label}: ${context.raw} Beds`;
          },
        },
      },
    },
  };

  return (
    <div className="w-full rounded-2xl bg-slate p-1 shadow-lg">

      {/* Header */}
      <div className="mb-2">
        <p className="text-sm text-gray-500">
          Hostel and bed occupancy statistics
        </p>
      </div>

      {/* Stats */}
      <div className="mb-2 grid grid-cols-1 gap-4 sm:grid-cols-3">

        {/* Hostels */}
        <div className="rounded-xl bg-slate-800 p-4 h-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Hostels
              </p>
              <h3 className="mt-1 text-3xl font-bold text-purple-600">
                {summary.totalHostels}
              </h3>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100 text-2xl">
              🏢
            </div>
          </div>
        </div>

        {/* Total Beds */}        
        <div className="rounded-xl bg-slate-800 p-4 h-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Total Beds
              </p>

              <h3 className="mt-1 text-3xl font-bold text-blue-600">
                {summary.totalBeds}
              </h3>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-2xl">
              🛏️
            </div>
          </div>
        </div>

        {/* Available Beds */}
        <div className="rounded-xl bg-slate-800 p-4 h-20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">
                Available Beds
              </p>

              <h3 className="mt-1 text-3xl font-bold text-green-600">
                {summary.availableBeds}
              </h3>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-2xl">
              🟢
            </div>
          </div>
        </div>

      </div>

      {/* Chart */}
      <div className="flex flex-col items-center justify-center">

        <div className="relative h-[280px] w-full max-w-[300px]">

          <Doughnut
            data={chartData}
            options={chartOptions}
          />

          {/* Center Text */}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-800">
              {occupancyPercentage}%
            </span>

            <span className="text-sm text-gray-500">
              Occupied
            </span>
          </div>

        </div>

        {/* Bottom info */}
        <div className="mt-4 flex flex-wrap justify-center gap-6 text-sm">

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500" />
            <span className="text-gray-600">
              Occupied: <strong>{summary.occupiedBeds}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-green-500" />
            <span className="text-gray-600">
              Available: <strong>{summary.availableBeds}</strong>
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

export default HostelOverview;
