import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import {
  Add,
  KeyboardDoubleArrowRight,
  BarChart,
  ScatterPlot,
  ShowChart,
} from "@mui/icons-material";
import Button from "@mui/material/Button";
import GenerateGraphModal from "../modal/DataFormModal";
import { FormDataContext } from "../../pages/DataVisualize";
import { useQuery, gql } from "@apollo/client";

type SidebarProps = {
  onSubmit: () => void;
  onGraphSelect: (graphData: any) => void;
};

const GET_GRAPH = gql`
  query GetLastestGraph($latest: Int) {
    getLastestGraph(latest: $latest)
  }
`;

const GET_GRAPH_BY_ID = gql`
  query GetGraphById($id: String!) {
    getGraphById(id: $id)
  }
`;

  const Sidebar: React.FC<SidebarProps> = ({ onSubmit, onGraphSelect }) => {
  const [selectedGraphId, setSelectedGraphId] = useState<string | null>(null);

  const { data: generatedGraphData } = useQuery<{ getLastestGraph: any[] }>(
    GET_GRAPH,
    {
      variables: { latest: 0 },
    }
  );

  const { data: selectedGraphData } = useQuery(GET_GRAPH_BY_ID, {
    variables: { id: selectedGraphId },
    skip: !selectedGraphId,
    onCompleted: (data) => {
      if (data.getGraphById) {
        handleGraphSelect(data.getGraphById);
      }
    },
  });

  const result = generatedGraphData?.getLastestGraph ?? [];
  console.log(result);

  const [open, setOpen] = useState<boolean>(true);
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

  const handleGraphSelect = (graphData: any) => {
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

  return (
    <div className="flex">
      <div
        className={`${
          open ? "w-72" : "w-20"
        } bg-slate-100 h-screen p-5 pt-2 relative duration-200`}
      >
        <ul className="gap-x-2 pt-6">
          <li>
            <IconButton
              color="inherit"
              onClick={() => setOpen(!open)}
              className={`absolute -right-3 w-7 ${!open && "rotate-180"}`}
            >
              <KeyboardDoubleArrowRight />
            </IconButton>
          </li>
          <li
            className={`flex rounded-md hover:bg-light-white text-sm items-center gap-x-4 
              ${open ? "p-2" : "p-0"}`}
          >
            <Button
              startIcon={<Add />}
              color="inherit"
              onClick={() => {
                setModalOpen(true);
                resetFields();
              }}
            >
              <span
                className={`${
                  !open && "hidden"
                } text-base pl-2 origin-left duration-200`}
              >
                {"Generate Graph"}
              </span>
            </Button>
          </li>
          <li>
            <h2 className={`p-4 pl-5 origin-left duration-200 text-gray-500 `}>
              {!open ? "-" : "Recently Generated Graphs"}
            </h2>
          </li>
          {result.map((r) => (
            <li
              className={`flex rounded-md hover:bg-light-white text-sm items-center gap-x-4 
                ${open ? "p-2" : "p-0"} ${
                selectedGraphId === r.id ? "bg-blue-100" : ""
                }`}
            >
              <Button color="inherit">
                <span className="mr-2">
                  {r.graphtype === "bar" ? (
                    <BarChart />
                  ) : r.graphtype === "line" ? (
                    <ShowChart />
                  ) : r.graphtype === "scatter" ? (
                    <ScatterPlot />
                  ) : null}
                </span>
                <span
                  className={`${
                    !open && "hidden"
                  } text-base pl-2 origin-left duration-200`}
                >
                  {r.properties[0]?.["graph title"] === ""
                    ? r.graphtype + " Graph"
                    : r.properties[0]?.["graph title"]}{" "}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </div>
      {modalOpen && (
        <GenerateGraphModal setOpenModal={setModalOpen} onSubmit={onSubmit} />
      )}
    </div>
  );
};

export default Sidebar;
