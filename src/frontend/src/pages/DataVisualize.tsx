import React, { useState } from "react";
import GraphSideBar from "../components/sidebars/GraphSideBar";
import ScatterPlot from "../components/graphs/scatter-plot";
import { useQuery, gql, useMutation } from "@apollo/client";

type FormDataType = {
  selectedGraphType: string;
  setSelectedGraphType: (value: string) => void;
  selectedDates: string[];
  setSelectedDates: (value: string[]) => void;
  selectedParamType: string;
  setSelectedParamType: (value: string) => void;
  selectedParamX: string;
  setSelectedParamX: (value: string) => void;
  selectedParamY: string;
  setSelectedParamY: (value: string) => void;
  timeMinX: string;
  setTimeMinX: (value: string) => void;
  timeMaxX: string;
  setTimeMaxX: (value: string) => void;
  timeMinY: string;
  setTimeMinY: (value: string) => void;
  timeMaxY: string;
  setTimeMaxY: (value: string) => void;
  minX: string;
  setMinX: (value: string) => void;
  maxX: string;
  setMaxX: (value: string) => void;
  minY: string;
  setMinY: (value: string) => void;
  maxY: string;
  setMaxY: (value: string) => void;
  graphTitle: string;
  setGraphTitle: (value: string) => void;
  xLabel: string;
  setXLabel: (value: string) => void;
  yLabel: string;
  setYLabel: (value: string) => void;
  submit: boolean;
  setSubmit: (value: boolean) => void;
};

const defaultContextValue: FormDataType = {
  selectedGraphType: "",
  setSelectedGraphType: () => {},
  selectedDates: [],
  setSelectedDates: () => {},
  selectedParamType: "",
  setSelectedParamType: () => {},
  selectedParamX: "",
  setSelectedParamX: () => {},
  selectedParamY: "",
  setSelectedParamY: () => {},
  timeMinX: "",
  setTimeMinX: () => {},
  timeMaxX: "",
  setTimeMaxX: () => {},
  timeMinY: "",
  setTimeMinY: () => {},
  timeMaxY: "",
  setTimeMaxY: () => {},
  minX: "",
  setMinX: () => {},
  maxX: "",
  setMaxX: () => {},
  minY: "",
  setMinY: () => {},
  maxY: "",
  setMaxY: () => {},
  graphTitle: "",
  setGraphTitle: () => {},
  xLabel: "",
  setXLabel: () => {},
  yLabel: "",
  setYLabel: () => {},
  submit: false,
  setSubmit: () => {},
};

export const FormDataContext =
  React.createContext<FormDataType>(defaultContextValue);

const FILTER_COLLECTDATA = gql`
  query GetFilterCollectionData(
    $attributes: [String!]!
    $collection: String!
    $dates: [String]
  ) {
    getFilterCollectionData(
      attributes: $attributes
      collection: $collection
      dates: $dates
    )
  }
`;

const SAVE_GRAPH = gql`
  mutation AddGeneratedGraphs(
    $graphType: String!
    $data: [JSON]!
    $properties: [JSON]!
  ) {
    addGeneratedGraphs(
      graphType: $graphType
      data: $data
      properties: $properties
    )
  }
`;

const DataVisualize: React.FC = () => {
  const [selectedGraphType, setSelectedGraphType] = useState<string>("");
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [selectedParamType, setSelectedParamType] = useState<string>("");
  const [selectedParamX, setSelectedParamX] = useState<string>("");
  const [selectedParamY, setSelectedParamY] = useState<string>("");
  const [timeMinX, setTimeMinX] = useState("");
  const [timeMaxX, setTimeMaxX] = useState("");
  const [timeMinY, setTimeMinY] = useState("");
  const [timeMaxY, setTimeMaxY] = useState("");
  const [minX, setMinX] = useState("");
  const [maxX, setMaxX] = useState("");
  const [minY, setMinY] = useState("");
  const [maxY, setMaxY] = useState("");
  const [graphTitle, setGraphTitle] = useState("");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [submit, setSubmit] = useState(false);

  const contextValue: FormDataType = {
    selectedGraphType,
    setSelectedGraphType,
    selectedDates,
    setSelectedDates,
    selectedParamType,
    setSelectedParamType,
    selectedParamX,
    setSelectedParamX,
    selectedParamY,
    setSelectedParamY,
    timeMinX,
    setTimeMinX,
    timeMaxX,
    setTimeMaxX,
    timeMinY,
    setTimeMinY,
    timeMaxY,
    setTimeMaxY,
    minX,
    setMinX,
    maxX,
    setMaxX,
    minY,
    setMinY,
    maxY,
    setMaxY,
    graphTitle,
    setGraphTitle,
    xLabel,
    setXLabel,
    yLabel,
    setYLabel,
    submit,
    setSubmit,
  };

  const { data, loading, error } = useQuery<{
    getFilterCollectionData: any[];
  }>(FILTER_COLLECTDATA, {
    variables: {
      attributes: [selectedParamX, selectedParamY],
      collection: selectedParamType,
      dates: selectedDates,
    },
    skip: !submit,
  });

  const transformDataForScatter = (rawData: any[]) => {
    return rawData.map((item, index) => ({
      label: `Point ${index + 1}`,  
      x: parseFloat(item[selectedParamX]),
      y: parseFloat(item[selectedParamY])
    }));
  };

  const graphData = data?.getFilterCollectionData
    ? transformDataForScatter(data.getFilterCollectionData)
    : [];

  const [addGeneratedGraphs] = useMutation(SAVE_GRAPH);
  
  const graphProperties = {
    "graph title": graphTitle,
    "Selected Dates": selectedDates,
    "x time min": timeMinX ? parseFloat(timeMinX) : undefined,
    "x time max": timeMaxX ? parseFloat(timeMaxX) : undefined,
    "y time min": timeMinY ? parseFloat(timeMinY) : undefined,
    "y time max": timeMaxY ? parseFloat(timeMaxY) : undefined,
    "min x": minX ? parseFloat(minX) : undefined,
    "max x": maxX ? parseFloat(maxX) : undefined,
    "min y": minY ? parseFloat(minY) : undefined,
    "max y": maxY ? parseFloat(maxY) : undefined,
    "x label": xLabel,
    "y label": yLabel,
  };

  const saveGraph = async () => {
    try {
      await addGeneratedGraphs({
        variables: {
          graphType: selectedGraphType,
          data: data?.getFilterCollectionData ?? [],
          properties: [graphProperties], 
        },
      });
    } catch (error) {
      console.error("Error saving graph:", error);
    }
  };

  const handleGraphData = async () => {
    setSubmit(true);
  };

  const graphWidth = 800;
  const graphHeight = 600;

  React.useEffect(() => {
    if (!loading && submit) {
      saveGraph();
    }
  }, [loading, submit, data?.getFilterCollectionData]);

  return (
    <FormDataContext.Provider value={contextValue}>
      <div className="flex">
        <GraphSideBar onSubmit={handleGraphData} />
        <div className="flex flex-col items-center justify-center h-screen w-full">
          {loading && <p>Loading...</p>}
          {error && <p>Error: {error.message}</p>}
          {submit && (
            <>
              {selectedGraphType === "bar" ? (
                <p>bar</p>
              ) : selectedGraphType === "line" ? (
                <p>line</p>
              ) : selectedGraphType === "scatter" ? (
                <div className="relative p-4 bg-white rounded-lg shadow-lg">
                  <div className="relative">
                    <ScatterPlot
                      data={graphData}
                      properties={graphProperties}
                      width={graphWidth}
                      height={graphHeight}
                    />
                  </div>
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>
    </FormDataContext.Provider>
  );
};

export default DataVisualize;