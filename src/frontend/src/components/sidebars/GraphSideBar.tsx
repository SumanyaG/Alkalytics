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
import GenerateGraphModal from "../modal/DataFormModal";
import { FormDataContext } from "../../pages/DataVisualize";
import { useQuery, gql } from "@apollo/client";

type GraphSideBarProps = {
  onSubmit: () => void;
  onGraphSelect: (graphData: any) => void;
};

const GET_GRAPH = gql`
  query GetLastestGraph($latest: Int) {
    getLastestGraph(latest: $latest)
  }
`;

const GraphSideBar: React.FC<GraphSideBarProps> = ({ onSubmit, onGraphSelect }) => {
  const [selectedGraphId, setSelectedGraphId] = useState<number | null>(null);

  const { data: generatedGraphData } = useQuery<{ getLastestGraph: any[] }>(
    GET_GRAPH,
    {
      variables: { latest: 0 },
    }
  );

  const result = generatedGraphData?.getLastestGraph ?? [];
  console.log(result);

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    setSelectedGraphType,
    setSelectedDates,
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
    setSelectedDates([]);
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
    setSelectedDates(graphData.properties[0]?.["Selected Dates"] || []);
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
    const selectedGraph = result.find((graph) => graph._id === id);
    if (selectedGraph) {
      handleGraphData(selectedGraph);
    }
  };

  return (
    <div className="flex">
      <div
        className={`${
          isOpen ? "w-72" : "w-20"
        } bg-white text-blue-900 h-screen p-5 pt-2 relative shadow-lg rounded-lg duration-200 transition-all`}
      >
        <ul className="gap-x-2 pt-6">
          <li>
            <IconButton
              color="inherit"
              onClick={() => setIsOpen(!isOpen)}
              className={`absolute -top-2 right-0 w-7 transform ${
                !isOpen && "rotate-180"
              } transition-transform ${
                !isOpen ? "left-1/2 transform -translate-x-1/2" : "left-auto"
              }`}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
          </li>
          <div className={`relative mt-3 mb-8 items-center ${isOpen ? "" : "ml-3"}`}>
            <li className="flex rounded-md hover:bg-light-white text-sm items-center gap-x-4">
              <Button
                startIcon={<Add />}
                color="inherit"
                className="absolute top-0 left-1/2 transform -translate-x-1/2"
                onClick={() => {
                  setModalOpen(true);
                  resetFields();
                }}
              >
                {isOpen && (
                  <span
                    className="text-base pl-2 transition-all duration-200 font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                  >
                    Generate New Graph
                  </span>
                )}
              </Button>
            </li>
          </div>
          <div className={`relative mt-0 mb-4 items-center ${isOpen ? "ml-1" : "ml-2"}`}>
            <li className="flex text-sm items-center">
              <History />
              {isOpen && (
                <span
                  className="text-xs pl-2 transition-all duration-200 font-bold whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  RECENTLY GENERATED GRAPHS
                </span>
              )}
            </li>
          </div>
          <div className={`relative items-center ${isOpen ? "-ml-0" : "-ml-3"}`}>
          {result.map((r) => (
            <li
              key={r._id}
              className={`flex rounded-md hover:bg-light-white text-sm items-center gap-x-4 mb-2 
                ${
                selectedGraphId === r._id ? "bg-blue-100" : ""
              }`}
            >
              <Button color="inherit" className="flex" onClick={() => handleSelectGraph(r._id)}>
                <span>
                  {r.graphtype === "bar" ? (
                    <BarChart />
                  ) : r.graphtype === "line" ? (
                    <ShowChart />
                  ) : r.graphtype === "scatter" ? (
                    <ScatterPlot />
                  ) : null}
                </span>
                {isOpen && (
                <span
                  className="text-sm pl-2 origin-left transition-all duration-200 font-medium whitespace-nowrap overflow-hidden text-ellipsis"
                >
                  {r.properties[0]?.["graph title"] === ""
                    ? r.graphtype + " Graph"
                    : r.properties[0]?.["graph title"]}{" "}
                </span>
              )}
              </Button>
            </li>
          ))}
          </div>
        </ul>
      </div>
      {modalOpen && (
        <GenerateGraphModal setOpenModal={setModalOpen} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default GraphSideBar;
