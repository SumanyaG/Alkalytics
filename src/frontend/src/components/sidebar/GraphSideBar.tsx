import type React from "react";
import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import AddIcon from "@mui/icons-material/Add";
import HistoryIcon from "@mui/icons-material/History";
import BarChartIcon from "@mui/icons-material/BarChart";
import ShowChartIcon from "@mui/icons-material/ShowChart";
import ScatterPlotIcon from "@mui/icons-material/ScatterPlot";
import DeleteIcon from "@mui/icons-material/Delete";
import GenerateGraphModal from "../modal/DataFormModal";
import { FormDataContext } from "../../pages/DataVisualize";
import useGraphs from "../../hooks/useGraphs";

type GraphSideBarProps = {
  onSubmit: () => void;
  onGraphSelect: (graphData: any) => void;
  deleteGraph: (graphId: number) => Promise<void>;
  isOpen: boolean;
  onToggleSidebar: (value: boolean) => void;
  isModalOpen: boolean;
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const GraphSideBar: React.FC<GraphSideBarProps> = ({
  onSubmit,
  onGraphSelect,
  deleteGraph,
  isOpen,
  onToggleSidebar,
  isModalOpen,
  setIsModalOpen,
}) => {
  const [selectedGraphId, setSelectedGraphId] = useState<number | null>(null);

  const { latestGraphs, loading, error, refetch } = useGraphs(0);
  const validGraphs =
    latestGraphs?.filter((graph) => graph !== null && graph !== undefined) ??
    [];

  const {
    setGraphType,
    setParamType,
    setParamX,
    setParamY,
    setXValue,
    setYValue,
    setSelectedDates,
    setTimeMinX,
    setTimeMaxX,
    setTimeMinY,
    setTimeMaxY,
    setMinX,
    setMaxX,
    setMinY,
    setMaxY,
    setGraphTitle,
    setXLabel,
    setYLabel,
    setSubmit,
  } = useContext(FormDataContext);

  const resetFields = () => {
    setGraphType("");
    setParamType("");
    setParamX("");
    setParamY("");
    setXValue("");
    setYValue("");
    setSelectedDates([]);
    setTimeMinX("");
    setTimeMaxX("");
    setTimeMinY("");
    setTimeMaxY("");
    setMinX("");
    setMaxX("");
    setMinY("");
    setMaxY("");
    setGraphTitle("");
    setXLabel("");
    setYLabel("");
    setSubmit(false);
  };

  const handleSelectGraph = (id: number) => {
    setSelectedGraphId(id);
    const graphData = latestGraphs.find((graph) => graph._id === id);
    if (graphData) {
      onGraphSelect(graphData);
    }
  };

  return (
    <>
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
          {/* New Graph Button Section */}
          <div className="mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center pl-[0.65rem]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                  <AddIcon className="text-blue-600" />
                </div>
                {isOpen && (
                  <button
                    className="text-sm font-bold text-blue-500 hover:bg-blue-50/70 
                    rounded-md px-1 py-2 transition-all"
                    onClick={() => {
                      setIsModalOpen(true);
                      resetFields();
                    }}
                  >
                    GENERATE NEW GRAPH
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Graphs Section */}
          <div className="flex-1 flex flex-col mt-2 overflow-hidden">
            <div className="flex items-center justify-between">
              <div className="flex items-center pl-[0.65rem]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                  <HistoryIcon className="text-blue-600" />
                </div>
                {isOpen && (
                  <span className="ml-2 text-xs font-semibold text-blue-500">
                    RECENT GRAPHS
                  </span>
                )}
              </div>
            </div>

            {/* Graphs List - scrollable area */}
            <div className="flex-1 overflow-y-auto pl-[0.9rem] pr-1 scrollbar-thin">
              <ul className="pb-4">
                {loading ? (
                  <li className="flex justify-between rounded-lg my-2 text-sm  font-semibold text-blue-600 animate-pulse whitespace-nowrap overflow-hidden text-ellipsis">
                    LOADING...
                  </li>
                ) : error ? (
                  <li className="flex justify-between rounded-lg my-2 text-sm font-semibold
                  text-red-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    Error Fetching Graphs
                  </li>
                ) : (
                  validGraphs.map((graph, index) => (
                    <li
                      key={`graph-${index}`}
                      onClick={() => handleSelectGraph(graph._id)}
                      className={`group flex items-center ${
                        isOpen ? "justify-between" : "justify-center"
                      } cursor-pointer rounded-lg p-1 my-2 transition-all duration-200
                      hover:bg-blue-50/70 ${
                        selectedGraphId === graph._id
                          ? "bg-blue-100/70 shadow-sm"
                          : ""
                      }`}
                    >
                      <div className="flex items-center">
                        {graph.graphtype === "bar" ? (
                          <BarChartIcon
                            className="text-blue-600"
                            fontSize="small"
                          />
                        ) : graph.graphtype === "line" ? (
                          <ShowChartIcon
                            className="text-blue-600"
                            fontSize="small"
                          />
                        ) : graph.graphtype === "scatter" ? (
                          <ScatterPlotIcon
                            className="text-blue-600"
                            fontSize="small"
                          />
                        ) : null}
                        {isOpen && (
                          <span className="ml-2 text-sm text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                            {graph.properties[0]?.["graph title"] === ""
                              ? graph.graphtype + " Graph"
                              : graph.properties[0]?.["graph title"]}
                          </span>
                        )}
                      </div>
                      {isOpen && (
                        <DeleteIcon
                          className="invisible group-hover:visible text-blue-900"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteGraph(graph._id);
                            refetch();
                          }}
                        />
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div>
        {isModalOpen && (
          <GenerateGraphModal setOpenModal={setIsModalOpen} onSubmit={onSubmit} />
        )}
      </div>
    </>
  );
};

export default GraphSideBar;
