import { useState, useEffect } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DatasetOutlined from "@mui/icons-material/DatasetOutlined";

interface ListSidebarProps {
  experimentIds: string[];
  experimentSheets?: string[];
  selectedExperiment: string | null;
  onSelectExperiment: (experimentId: string) => void;
  isOpen: boolean;
  onToggleSidebar: (value: boolean) => void;
}

const ListSidebar: React.FC<ListSidebarProps> = ({
  experimentIds,
  experimentSheets = ["Exp"],
  selectedExperiment,
  onSelectExperiment,
  isOpen,
  onToggleSidebar,
}) => {
  return (
    <div
      className={`sidebar ${
        isOpen ? "min-w-72" : "min-w-20"
      } bg-white text-blue-900 h-screen p-5 pt-2 relative shadow-lg rounded-lg duration-200 transition-all`}
    >
      <IconButton
        color="inherit"
        onClick={() => onToggleSidebar(!isOpen)}
        className={`absolute top-4 right-0 w-7 transform ${
          !isOpen && "rotate-180"
        } transition-transform ${
          !isOpen ? "left-1/2 transform -translate-x-1/2" : "left-auto"
        }`}
      >
        <KeyboardDoubleArrowRightIcon />
      </IconButton>

      <ul className="h-[95%]">
        <li className="relative mt-8 h-[5%]">
          <div
            className={`flex items-center ${isOpen ? "justify-between" : ""}`}
          >
            <div className="pl-[0.65rem]">
              <DescriptionOutlinedIcon />
              {isOpen && (
                <span
                  className="font-bold text-xs text-blue-900 ml-2"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  EXPERIMENTS
                </span>
              )}
            </div>
          </div>
          <div className={`overflow-y-auto h-full max-h-[100%] pl-[0.9rem]`}>
            <ul className="mt-2">
              {experimentSheets.map((item, index) => (
                <li
                  key={`data-${index}`}
                  onClick={() => onSelectExperiment(item)}
                  className={`flex ${
                    isOpen ? "gap-3" : ""
                  } items-center p-1 cursor-pointer hover:bg-blue-100 rounded-lg h-6`}
                >
                  <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
                  <span
                    className="text-sm"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {isOpen ? item : undefined}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </li>

        <li className="relative mt-4 h-[90%]">
          <div
            className={`flex items-center ${isOpen ? "justify-between" : ""}`}
          >
            <div className="pl-[0.65rem]">
              <DatasetOutlined className="" />
              {isOpen && (
                <span
                  className="font-bold text-xs text-blue-900 ml-2"
                  style={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  DATA
                </span>
              )}
            </div>
          </div>
          <div className={`overflow-y-auto h-full max-h-[100%] pl-[0.9rem]`}>
            <ul className="mt-2">
              {experimentIds.map((item, index) => (
                <li
                  key={`data-${index}`}
                  onClick={() => onSelectExperiment(item)}
                  className={`flex ${
                    isOpen ? "gap-3" : ""
                  } items-center p-1 cursor-pointer hover:bg-blue-100 rounded-lg h-6 ${
                    selectedExperiment === item ? "bg-blue-200" : ""
                  }`}
                >
                  <span className="w-1.5 h-1.5 bg-blue-900 rounded-full"></span>
                  <span
                    className="text-sm"
                    style={{
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {isOpen ? item : undefined}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </li>
      </ul>
    </div>
  );
};

export default ListSidebar;
