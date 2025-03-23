import type React from "react";

import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import {
  Add,
  KeyboardDoubleArrowRight,
  BarChart,
  ScatterPlot,
  ShowChart,
  History,
} from "@mui/icons-material";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import GenerateGraphModal from "../modal/DataFormModal";
import { FormDataContext } from "../../pages/DataVisualize";
import useGraphs from "../../hooks/useGraphs";

type GraphSideBarProps = {
  onSubmit: () => void;
  onGraphSelect: (graphData: any) => void;
  deleteGraph: (graphId: number) => Promise<void>;
};

const GraphSideBar: React.FC<GraphSideBarProps> = ({
  onSubmit,
  onGraphSelect,
  deleteGraph,
}) => {
  const [selectedGraphId, setSelectedGraphId] = useState<number | null>(null);

  const { latestGraphs, loading, error } = useGraphs(0);
  const validGraphs =
    latestGraphs?.filter((graph) => graph !== null && graph !== undefined) ??
    [];

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    setSelectedGraphType,
    setSelectedParamType,
    setSelectedParamX,
    setSelectedParamY,
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
    setSelectedGraphType("");
    setSelectedParamType("");
    setSelectedParamX("");
    setSelectedParamY("");
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

  const handleGraphData = (graphData: any) => {
    setSelectedGraphType(graphData.graphtype);
    setGraphTitle(graphData.properties[0]?.["graph title"] || "");
    setTimeMinX(graphData.properties[0]?.["x time min"] || "");
    setTimeMaxX(graphData.properties[0]?.["x time max"] || "");
    setTimeMinY(graphData.properties[0]?.["y time min"] || "");
    setTimeMaxY(graphData.properties[0]?.["y time max"] || "");
    setMinX(graphData.properties[0]?.["min x"] || "");
    setMaxX(graphData.properties[0]?.["max x"] || "");
    setMinY(graphData.properties[0]?.["min y"] || "");
    setMaxY(graphData.properties[0]?.["max y"] || "");
    setXLabel(graphData.properties[0]?.["x label"] || "");
    setYLabel(graphData.properties[0]?.["y label"] || "");

    onGraphSelect(graphData);
    setSubmit(true);
  };

  const handleSelectGraph = (id: number) => {
    setSelectedGraphId(id);
    const selectedGraph = latestGraphs.find((graph) => graph._id === id);
    if (selectedGraph) {
      handleGraphData(selectedGraph);
    }
  };

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "min-w-72" : "min-w-20"
        } relative h-screen overflow-hidden rounded-r-xl border-r border-white/20 bg-white/95 p-5 pt-2 shadow-[5px_0_30px_rgba(0,0,0,0.08)] backdrop-blur-sm transition-all duration-300`}
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(219,234,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(219,234,254,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70"></div>
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400/20 via-blue-500/10 to-transparent"></div>

        {/* Toggle button */}
        <IconButton
          color="primary"
          onClick={() => setIsOpen(!isOpen)}
          className={`absolute -right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 shadow-md transition-all hover:bg-blue-50 ${
            !isOpen && "rotate-180"
          } transform transition-transform ${
            !isOpen ? "left-1/2 -translate-x-1/2 transform" : "left-auto"
          }`}
        >
          <KeyboardDoubleArrowRight className="text-blue-500" />
        </IconButton>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-[calc(100%-20px)] pt-6">
          {/* New Graph Button Section */}
          <div className="mb-4">
            <div
              className={`flex items-center ${isOpen ? "justify-between" : ""}`}
            >
              <div className="flex items-center pl-[0.65rem]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                  <Add className="text-blue-600" />
                </div>
                {isOpen && (
                  <Button
                    className="ml-2 text-sm font-semibold text-blue-900 hover:bg-blue-50/70"
                    onClick={() => {
                      setModalOpen(true);
                      resetFields();
                    }}
                  >
                    Generate New Graph
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Recent Graphs Section */}
          <div className="flex-1 flex flex-col mt-2 overflow-hidden">
            <div
              className={`flex items-center ${isOpen ? "justify-between" : ""}`}
            >
              <div className="flex items-center pl-[0.65rem]">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100/50">
                  <History className="text-blue-600" />
                </div>
                {isOpen && (
                  <span className="ml-2 text-xs font-bold text-blue-500 whitespace-nowrap overflow-hidden text-ellipsis">
                    RECENTLY GENERATED GRAPHS
                  </span>
                )}
              </div>
            </div>

            {/* Graphs List - scrollable area */}
            <div className="flex-1 overflow-y-auto pl-[0.9rem] pr-1 mt-1">
              <ul className="pb-4">
                {loading ? (
                  <li className="text-sm font-semibold text-blue-400">
                    LOADING...
                  </li>
                ) : error ? (
                  <li className="text-sm font-semibold text-red-500">
                    Error fetching graphs
                  </li>
                ) : (
                  validGraphs.map((r) => (
                    <li
                      key={r._id}
                      onClick={() => handleSelectGraph(r._id)}
                      className={` group flex justify-between ${
                        isOpen ? "gap-2" : ""
                      } cursor-pointer items-center rounded-lg p-1 mb-0.5 transition-all duration-200 hover:bg-blue-50/70 ${
                        selectedGraphId === r._id
                          ? "bg-blue-100/70 shadow-sm"
                          : ""
                      }`}
                    >
                      <div>
                        {r.graphtype === "bar" ? (
                          <BarChart
                            className="text-blue-600"
                            fontSize="small"
                          />
                        ) : r.graphtype === "line" ? (
                          <ShowChart
                            className="text-blue-600"
                            fontSize="small"
                          />
                        ) : r.graphtype === "scatter" ? (
                          <ScatterPlot
                            className="text-blue-600"
                            fontSize="small"
                          />
                        ) : null}
                        {isOpen && (
                          <span className="text-sm text-blue-900 whitespace-nowrap overflow-hidden text-ellipsis">
                            {r.properties[0]?.["graph title"] === ""
                              ? r.graphtype + " Graph"
                              : r.properties[0]?.["graph title"]}
                          </span>
                        )}
                      </div>
                      <DeleteIcon
                        className="invisible group-hover:visible text-gray-600"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteGraph(r._id);
                        }}
                      ></DeleteIcon>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      {modalOpen && (
        <GenerateGraphModal setOpenModal={setModalOpen} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default GraphSideBar;
