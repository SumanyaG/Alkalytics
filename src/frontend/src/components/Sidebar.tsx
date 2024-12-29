import React, { useState } from "react";
import { Home, Search, CloudUpload, BarChart, Menu } from "@mui/icons-material";
import { IconButton } from "@mui/material";

const Sidebar: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false); // Controls visibility of the sidebar

  const toggleSidebarVisibility = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div>
      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full bg-blue-200 text-white transition-all duration-300 ease-in-out transform ${
          isVisible ? "translate-x-0" : "-translate-x-full"
        }`}
        style={{
          width: isVisible ? "60px" : "60px", // Sidebar just wide enough for the icons and padding
          height: "100%",
          zIndex: 50,
        }}
      >
        <div className="flex flex-col items-center justify-center h-full p-4">
          {/* Toggle Button */}
          <IconButton
            onClick={toggleSidebarVisibility}
            className="absolute top-4 right-4 bg-blue-700 hover:bg-blue-800 rounded-full"
          >
            {isVisible ? "×" : <Menu className="text-white" />}
          </IconButton>

          {/* Sidebar Links (Icons only) */}
          <div className="flex flex-col items-center space-y-6">
            <IconButton
              className="transition-all hover:scale-110 hover:text-blue-500"
              onClick={() => console.log("Go to Home")}
            >
              <Home className="text-white text-3xl" />
            </IconButton>
            <IconButton
              className="transition-all hover:scale-110 hover:text-blue-500"
              onClick={() => console.log("Go to Search")}
            >
              <Search className="text-white text-3xl" />
            </IconButton>
            <IconButton
              className="transition-all hover:scale-110 hover:text-blue-500"
              onClick={() => console.log("Go to Upload")}
            >
              <CloudUpload className="text-white text-3xl" />
            </IconButton>
            <IconButton
              className="transition-all hover:scale-110 hover:text-blue-500"
              onClick={() => console.log("Go to Charts")}
            >
              <BarChart className="text-white text-3xl" />
            </IconButton>
          </div>
        </div>
      </div>

      {/* Overlay for smoother transition */}
      {isVisible && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
          onClick={toggleSidebarVisibility}
        />
      )}
    </div>
  );
};

export default Sidebar;
