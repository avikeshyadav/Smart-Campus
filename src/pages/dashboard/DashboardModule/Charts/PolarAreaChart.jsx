import React from "react";
import {
  Chart as ChartJS,
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";

ChartJS.register(
  RadialLinearScale,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

const PolarAreaChart = ({ title = "Polar Area Chart" ,totalStudents}) => {
  const polarChartData = {
        labels: ["Total Students", "Today Attendane", "Student In Campus"],
        values: [totalStudents, 10, 10],
        label: "Details",
      };
  const chartData = {
    labels: polarChartData?.labels || [],
    datasets: [
      {
        label: polarChartData?.label || "Dataset 1",
        data: polarChartData?.values || [],
        backgroundColor: [
          "rgba(255, 99, 132, 0.5)",
          "rgba(255, 159, 64, 0.5)",
          "rgba(255, 205, 86, 0.5)",
          "rgba(75, 192, 192, 0.5)",
          "rgba(54, 162, 235, 0.5)",
          "rgba(153, 102, 255, 0.5)",
        ],
        borderColor: [
          "rgb(255, 99, 132)",
          "rgb(255, 159, 64)",
          "rgb(255, 205, 86)",
          "rgb(75, 192, 192)",
          "rgb(54, 162, 235)",
          "rgb(153, 102, 255)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <PolarArea data={chartData} options={options} />
    </div>
  );
};

export default PolarAreaChart;
