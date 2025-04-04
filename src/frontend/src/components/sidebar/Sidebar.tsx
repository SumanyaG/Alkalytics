import Tooltip from "@mui/material/Tooltip";
import { Link, useLocation } from "react-router-dom";
import AccountMenu from "../auth/AccountMenu";

const menuItems = [
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
        <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
      </svg>
    ),
    label: "Dashboard",
    route: "/dashboard",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-7"
      >
        <path
          fill-rule="evenodd"
          d="M1.5 5.625c0-1.036.84-1.875 1.875-1.875h17.25c1.035 0 1.875.84 1.875 1.875v12.75c0 1.035-.84 1.875-1.875 1.875H3.375A1.875 1.875 0 0 1 1.5 18.375V5.625ZM21 9.375A.375.375 0 0 0 20.625 9h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5Zm0 3.75a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5a.375.375 0 0 0 .375-.375v-1.5ZM10.875 18.75a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375h7.5ZM3.375 15h7.5a.375.375 0 0 0 .375-.375v-1.5a.375.375 0 0 0-.375-.375h-7.5a.375.375 0 0 0-.375.375v1.5c0 .207.168.375.375.375Zm0-3.75h7.5a.375.375 0 0 0 .375-.375v-1.5A.375.375 0 0 0 10.875 9h-7.5A.375.375 0 0 0 3 9.375v1.5c0 .207.168.375.375.375Z"
          clip-rule="evenodd"
        />
      </svg>
    ),
    label: "Data",
    route: "/table",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-7"
      >
        <path
          fill-rule="evenodd"
          d="M10.5 3.75a6 6 0 0 0-5.98 6.496A5.25 5.25 0 0 0 6.75 20.25H18a4.5 4.5 0 0 0 2.206-8.423 3.75 3.75 0 0 0-4.133-4.303A6.001 6.001 0 0 0 10.5 3.75Zm2.03 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v4.94a.75.75 0 0 0 1.5 0v-4.94l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z"
          clip-rule="evenodd"
        />
      </svg>
    ),
    label: "Upload",
    route: "/upload",
  },
  {
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="size-6"
      >
        <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75ZM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 0 1-1.875-1.875V8.625ZM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 0 1 3 19.875v-6.75Z" />
      </svg>
    ),
    label: "Graphs",
    route: "/graphs",
  },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <div className="fixed left-0 top-0 flex h-full w-20 flex-col justify-between border-r border-white/5 bg-[#050b2e] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVlcj48cGF0aCBkPSJNMCAwaDMwMHYzMDBIeiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')] py-6 text-white shadow-[5px_0_30px_rgba(0,0,0,0.3)]">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.1)_1px,transparent_1px)] bg-[size:20px_20px]"></div>

      {/* Logo area */}
      <div className="relative z-10 flex items-center justify-center py-4">
        <div className="relative">
          <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-md"></div>
          <h1 className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-xl font-bold text-transparent">
            A
          </h1>
        </div>
      </div>

      {/* Navigation icons */}
      <div className="relative z-10 flex flex-grow flex-col items-center justify-center space-y-12">
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.route;

          return (
            <Tooltip
              key={index}
              title={item.label}
              arrow
              placement="right"
              slotProps={{
                tooltip: {
                  sx: {
                    padding: "8px 16px",
                    maxWidth: "300px",
                    background: "rgba(30, 58, 138, 0.8)",
                    backdropFilter: "blur(8px)",
                    color: "white",
                    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                    fontSize: "0.875rem",
                    fontWeight: "600",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "8px",
                  },
                },
                arrow: {
                  sx: {
                    color: "rgba(30, 58, 138, 0.8)",
                  },
                },
              }}
            >
              <Link
                to={item.route}
                className={`group relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
                  isActive
                    ? "bg-blue-600/20 text-white"
                    : "text-blue-300/70 hover:text-blue-300"
                }`}
              >
                {/* Background glow effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-blue-600/20 blur-sm"></div>
                )}

                {/* Icon */}
                <div className="relative z-10 transition-transform duration-300 group-hover:scale-110">
                  {item.icon}
                </div>

                {/* Hover indicator */}
                <div
                  className={`absolute bottom-1.5 h-0.5 w-0 rounded-full bg-white transition-all duration-300 ${
                    isActive ? "w-6" : "group-hover:w-6"
                  }`}
                ></div>
              </Link>
            </Tooltip>
          );
        })}
      </div>

      {/* Account menu */}
      <div className="relative z-10 flex justify-center pb-4">
        <div className="group relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl transition-all duration-300 hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-indigo-600/20">
          <AccountMenu />
          <div className="absolute bottom-1.5 h-0.5 w-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-6"></div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
