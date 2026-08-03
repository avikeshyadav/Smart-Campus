import * as modules from "../../pages/dashboard/index5";

export type DashboardNavItem = {
  label: string;
  path: string;
  subItems?: {
    label: string;
    path: string;
  }[];
};

// Dynamic modules
const moduleFiles = import.meta.glob(
  "../../pages/dashboard/**/*.jsx",
  { eager: true }
);

const moduleNavItems: DashboardNavItem[] = Object.keys(moduleFiles).reduce(
  (items: DashboardNavItem[], filePath) => {
    const parts = filePath.split("/");

    const folder = parts[parts.length - 2];
    const file = parts[parts.length - 1].replace(".jsx", "");


    const excluded = [
      "StudentRecords",
      "ResumeBuilder",
      "Settings",
    ];

    if (excluded.includes(folder)) return items;

    let group = items.find((x) => x.label === folder);

    if (!group) {
      group = {
        label: folder,
        path: `/dashboard/${folder.toLowerCase()}`,
        subItems: [],
      };
      items.push(group);
    }

    group.subItems!.push({
      label:
        file === "index"
          ? "Overview"
          : file.replace(/([A-Z])/g, " $1").trim(),

      path: `/dashboard/${folder.toLowerCase()}/${file.toLowerCase()}`,
    });

    return items;
  },
  []
);

export const dashboardNavItems: DashboardNavItem[] = [
  // Hardcoded items
  { label: "Overview", path: "/dashboard" },

  {
    label: "Student Records",
    path: "/dashboard/students",
    subItems: [
      { label: "View", path: "/dashboard/students/view" },
      { label: "Edit", path: "/dashboard/students/edit" },
      { label: "Search", path: "/dashboard/students/search" },
    ],
  },

  { label: "Resume Builder", path: "/dashboard/resume" },
  { label: "Settings", path: "/dashboard/settings" },

  // Dynamic items
  ...moduleNavItems,
];

export const getDashboardNavItems = () => dashboardNavItems;