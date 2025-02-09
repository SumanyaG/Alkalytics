import React, { useState } from "react";
import GraphSideBar from "../components/sidebars/GraphSideBar";
import { useQuery, gql } from "@apollo/client";
import ScatterPlot from "../components/graphs/scatter-plot";

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

export const FormDataContext = React.createContext<FormDataType>(defaultContextValue);

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
  // return all data points with dates = those in selectedDates --> then filter by the params

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

  // Transform the data for the scatter plot
  const transformDataForScatter = (rawData: any[]) => {
    return rawData.map(item => ({
      x: parseFloat(item[selectedParamX]),
      y: parseFloat(item[selectedParamY])
    }));
  };

  const graphData = data?.getFilterCollectionData ? 
    transformDataForScatter(data.getFilterCollectionData) : [];

  const handleGraphData = async () => {
    setSubmit(true);
  };

  // Define dimensions for the scatter plot
  const graphWidth = 800;
  const graphHeight = 600;

  // To be used when creating the graph, additional properties
  const graphProperties = [
    { "graph title": graphTitle },
    { "Selected Dates": selectedDates },
    { "x time min": timeMinX },
    { "x time max": timeMaxX },
    { "y time min": timeMinY },
    { "y time max": timeMaxY },
    { "min x": minX },
    { "max x": maxX },
    { "min y": minY },
    { "max y": maxY },
    { "x label": xLabel },
    { "y label": yLabel },
  ];

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
                  <h2 className="text-xl font-bold mb-4 text-center">{graphTitle}</h2>
                  <div className="relative">
                    <ScatterPlot
                      data={graphData}
                      width={graphWidth}
                      height={graphHeight}
                    />
                    {/* Add labels */}
                    <div className="text-center mt-2">{xLabel}</div>
                    <div 
                      className="absolute left-0 top-1/2 transform -rotate-90 -translate-y-1/2 -translate-x-8"
                    >
                      {yLabel}
                    </div>
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