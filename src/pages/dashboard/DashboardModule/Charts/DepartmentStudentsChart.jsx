import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const data = [
  { course: "BCA", students: 125 },
  { course: "B.Tech", students: 180 },
  { course: "B.Sc", students: 95 },
  { course: "B.Com", students: 110 },
  { course: "MBA", students: 75 },
];

const DepartmentStudentsChart = () => {
  return (
    <div className="w-full rounded-2xl bg-slate p-12 shadow-lg ">
      
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          Students by Course
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Hostel students distribution according to courses
        </p>
      </div>

      {/* Chart */}
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 20,
              left: -10,
              bottom: 5,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
            />

            <XAxis
              dataKey="course"
              tick={{ fontSize: 14 }}
            />

            <YAxis
              tick={{ fontSize: 14 }}
            />

            <Tooltip />

            <Bar
              dataKey="students"
              name="Students"
              radius={[8, 8, 0, 0]}
              fill="#6366f1"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 border-t pt-5 md:grid-cols-3">
        
        <div>
          <p className="text-sm text-gray-500">
            Total Students
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            585
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Highest Course
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            B.Tech
          </h3>
        </div>

        <div>
          <p className="text-sm text-gray-500">
            Lowest Course
          </p>
          <h3 className="text-2xl font-bold text-gray-800">
            MBA
          </h3>
        </div>

      </div>
    </div>
  );
};

export default DepartmentStudentsChart;