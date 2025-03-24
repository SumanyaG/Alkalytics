import type React from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import DatasetOutlined from "@mui/icons-material/DatasetOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";

interface ListSidebarProps {
  experimentIds: string[];
  experimentSheets?: string[];
  efficiencies?: string[];
  selectedExperiment: string | null;
  onSelectExperiment: (experimentId: string) => void;
  isOpen: boolean;
  onToggleSidebar: (value: boolean) => void;
}

const ListSidebar: React.FC<ListSidebarProps> = ({
  experimentIds,
  experimentSheets = ["Exp"],
  efficiencies = ["Efficiency Calculations"],
  selectedExperiment,
  onSelectExperiment,
  isOpen,
  onToggleSidebar,
}) => {
  return (
    <div
      className={`sidebar ${
        isOpen ? "min-w-72" : "min-w-20"
      } relative h-screen overflow-hidden rounded-r-xl border-r border-white/20 bg-white/95 p-5 pt-2 shadow-[5px_0_30px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300`}
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(219,234,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(219,234,254,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70"></div>
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400/20 via-blue-500/10 to-transparent"></div>

      {/* Toggle button */}
      <IconButton
        color="primary"
        onClick={() => onToggleSidebar(!isOpen)}
        className={`absolute -right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md transition-all hover:bg-blue-50 ${
          !isOpen && "rotate-180"
        } transform transition-transform ${
          !isOpen ? "left-1/2 -translate-x-1/2 transform" : "left-auto"
        }`}
      >
        <KeyboardDoubleArrowRightIcon className="text-blue-500" />
      </IconButton>

      {/* Content */}
      <div className="relative z-10 flex flex-col h-[calc(100%-20px)] pt-6">
        {/* Experiments Section */}
        <div className="mb-2">
          <div
            className={`flex items-center ${isOpen ? "justify-between" : ""}`}
          >
            <div className="flex items-center pl-[0.65rem]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                <DescriptionOutlinedIcon className="text-blue-600" />
              </div>
              {isOpen && (
                <span className="ml-2 text-xs font-bold text-blue-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  EXPERIMENTS
                </span>
              )}
            </div>
          </div>
          <div className="max-h-24 overflow-y-auto pl-[0.9rem] scrollbar-thin">
            <ul className="mt-1">
              {experimentSheets.map((item, index) => (
                <li
                  key={`experiments-${index}`}
                  onClick={() => onSelectExperiment(item)}
                  className={`flex ${
                    isOpen ? "gap-2" : ""
                  } h-6 cursor-pointer items-center rounded-lg p-1 transition-all duration-200 hover:bg-blue-50/70 ${
                    selectedExperiment === item
                      ? "bg-blue-100/70 shadow-sm"
                      : ""
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {isOpen ? item : undefined}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Efficiencies Section */}
        <div className="my-2">
          <div
            className={`flex items-center ${isOpen ? "justify-between" : ""}`}
          >
            <div className="flex items-center pl-[0.65rem]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                <CalculateOutlinedIcon className="text-blue-600" />
              </div>
              {isOpen && (
                <span className="ml-2 text-xs font-bold text-blue-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  EFFICIENCIES
                </span>
              )}
            </div>
          </div>
          <div className="max-h-24 overflow-y-auto pl-[0.9rem] scrollbar-thin">
            <ul className="mt-1">
              {efficiencies.map((item, index) => (
                <li
                  key={`experiments-${index}`}
                  onClick={() => onSelectExperiment(item)}
                  className={`flex ${
                    isOpen ? "gap-2" : ""
                  } h-6 cursor-pointer items-center rounded-lg p-1 transition-all duration-200 hover:bg-blue-50/70 ${
                    selectedExperiment === item
                      ? "bg-blue-100/70 shadow-sm"
                      : ""
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {isOpen ? item : undefined}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-1 flex flex-col mt-2 overflow-hidden">
          <div
            className={`flex items-center ${isOpen ? "justify-between" : ""}`}
          >
            <div className="flex items-center pl-[0.65rem]">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                <DatasetOutlined className="text-blue-600" />
              </div>
              {isOpen && (
                <span className="ml-2 text-xs font-bold text-blue-500 whitespace-nowrap overflow-hidden text-ellipsis">
                  DATA
                </span>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto pl-[0.9rem] pr-1 mt-1">
            <ul className="pb-4">
              {experimentIds.map((item, index) => (
                <li
                  key={`data-${index}`}
                  onClick={() => onSelectExperiment(item)}
                  className={`flex ${
                    isOpen ? "gap-2" : ""
                  } h-6 cursor-pointer items-center rounded-lg p-1 mb-0.5 transition-all duration-200 hover:bg-blue-50/70 ${
                    selectedExperiment === item
                      ? "bg-blue-100/70 shadow-sm"
                      : ""
                  }`}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                  <span className="text-sm text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                    {isOpen ? item : undefined}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListSidebar;
