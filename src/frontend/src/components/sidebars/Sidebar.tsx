import { Home, Search, CloudUpload, BarChart, Person } from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import { Link } from "react-router-dom";

const Sidebar = () => {

  return (
    <div className="fixed top-0 left-0 h-full w-16 flex flex-col justify-between py-4 bg-blue-900 text-white">
      <div className="flex flex-col flex-grow justify-center mt-10 space-y-20">
        {[
          {
            icon: <Home className="scale-125" />,
            label: "Dashboard",
            route: "/",
          },
          {
            icon: <Search className="scale-125" />,
            label: "Queries",
            route: "/table",
          },
          {
            icon: <CloudUpload className="scale-125" />,
            label: "Upload",
            route: "/upload",
          },
          {
            icon: <BarChart className="scale-125" />,
            label: "Graphs",
            route: "/graphs",
          },
        ].map((item, index) => (
          <Tooltip
            key={index}
            title={item.label}
            arrow
            className="cursor-pointer text-3xl"
            placement="right"
            slotProps={{
              tooltip: {
                sx: {
                  padding: "8px 16px",
                  maxWidth: "300px",
                  bgcolor: "#1e3a8a",
                  color: "white",
                  boxShadow: "0 2px 6px #000",
                  fontSize: "1.1rem",
                  fontWeight: "600",
                },
              },
              arrow: {
                sx: {
                  color: "#1e3a8a",
                },
              },
            }}
          >
            <Link
              to={item.route}
              className="flex justify-center items-center rounded-full hover:scale-110 transition-all duration-200 ease-in-out"
            >
              {item.icon}
            </Link>
          </Tooltip>
        ))}
      </div>

      <a
        href="/"
        className="flex justify-center items-center p-4 mt-6 rounded-full hover:scale-110"
      >
        <Person className="scale-125"/>
      </a>
    </div>
  );
};

export default Sidebar;
