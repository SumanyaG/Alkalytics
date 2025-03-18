import { Home, Search, CloudUpload, BarChart } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { Link, useLocation } from "react-router-dom";
import AccountMenu from "../auth/AccountMenu";

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
        {[
          {
            icon: <Home className="text-2xl" />,
            label: "Dashboard",
            route: "/dashboard",
          },
          {
            icon: <Search className="text-2xl" />,
            label: "Queries",
            route: "/table",
          },
          {
            icon: <CloudUpload className="text-2xl" />,
            label: "Upload",
            route: "/upload",
          },
          {
            icon: <BarChart className="text-2xl" />,
            label: "Graphs",
            route: "/graphs",
          },
        ].map((item, index) => {
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
