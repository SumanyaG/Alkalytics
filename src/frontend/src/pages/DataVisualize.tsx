// -----------------------------------------------------------------------------
// Primary Author: Jennifer Y
// Contributors: Sumanya G, Kate M
// Year: 2025
// Component: DataVisualize
// Purpose: Main graph generation page for viewing and generating graphs.
// -----------------------------------------------------------------------------

import React, { useState, useRef } from "react";
import GraphSideBar from "../components/sidebar/GraphSideBar";
import ScatterPlot from "../components/graph/scatter-plot";
import LineGraph from "../components/graph/line-plot";
import BarGraph from "../components/graph/bar-graph";
import { useQuery, gql, useMutation } from "@apollo/client";

type FormDataType = {
  graphType: string;
  setGraphType: (value: string) => void;
  filterParam: string;
  setFilterParam: (value: string) => void;
  filterValue: string;
  setFilterValue: (value: string) => void;
  paramType: string;
  setParamType: (value: string) => void;
  paramX: string;
  setParamX: (value: string) => void;
  paramY: string;
  setParamY: (value: string) => void;
  xValue: string;
  setXValue: (value: string) => void;
  yValue: string;
  setYValue: (value: string) => void;
  selectedDates: string[];
  setSelectedDates: (value: string[]) => void;
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
  graphType: "",
  setGraphType: () => {},
  filterParam: "",
  setFilterParam: () => {},
  filterValue: "",
  setFilterValue: () => {},
  paramType: "",
  setParamType: () => {},
  paramX: "",
  setParamX: () => {},
  paramY: "",
  setParamY: () => {},
  xValue: "",
  setXValue: () => {},
  yValue: "",
  setYValue: () => {},
  selectedDates: [],
  setSelectedDates: () => {},
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
    $analysis: Boolean
  ) {
    getFilterCollectionData(
      attributes: $attributes
      collection: $collection
      dates: $dates
      analysis: $analysis
    ) {
      data
      analysisRes
    }
  }
`;

const SAVE_GRAPH = gql`
  mutation AddGeneratedGraphs(
    $graphType: String!
    $data: [JSON]!
    $properties: [JSON]!
    $attributes: [String!]!
  ) {
    addGeneratedGraphs(
      graphType: $graphType
      data: $data
      properties: $properties
      attributes: $attributes
    )
  }
`;

const REMOVE_GRAPH = gql`
  mutation RemoveGraph($graphId: Int!) {
    removeGraph(graphId: $graphId)
  }
`;

const DataVisualize: React.FC = () => {
  const [addGeneratedGraphs] = useMutation(SAVE_GRAPH);
  const [removeGraph] = useMutation(REMOVE_GRAPH);

  const [graphType, setGraphType] = useState<string>("");
  const [filterParam, setFilterParam] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [paramType, setParamType] = useState<string>("");
  const [paramX, setParamX] = useState<string>("");
  const [paramY, setParamY] = useState<string>("");
  const [xValue, setXValue] = useState<string>("");
  const [yValue, setYValue] = useState<string>("");
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
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

  const [selectedGraph, setSelectedGraph] = useState<boolean>(false);
  const [selectedGraphData, setSelectedGraphData] = useState<any>(null);
  const [selectedGraphProperties, setSelectedGraphProperties] = useState<any>(null);
  const [selectedGraphType, setSelectedGraphType] = useState<string | null>(null);

  const [isOpen, setIsOpen] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [submit, setSubmit] = useState<boolean>(false);

  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const contextValue: FormDataType = {
    graphType,
    setGraphType,
    filterParam,
    setFilterParam,
    filterValue,
    setFilterValue,
    paramType,
    setParamType,
    paramX,
    setParamX,
    paramY,
    setParamY,
    xValue,
    setXValue,
    yValue,
    setYValue,
    selectedDates,
    setSelectedDates,
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
    getFilterCollectionData: {
      data: any[];
      analysisRes?: any[];
    };
  }>(FILTER_COLLECTDATA, {
    variables: {
      attributes: [paramX, paramY],
      collection: paramType,
      dates: selectedDates,
      analysis: graphType === "scatter",
    },
    skip: !submit || selectedGraph,
  });

  const transformData = (rawData: any[], xParam: string, yParam: string) => {
    return rawData.map((item, index) => ({
      label: `Point ${index + 1}`,
      x: parseFloat(item[xParam]),
      y: parseFloat(item[yParam]),
    }));
  };

  const validateAndTransformRegression = (slope: number, intercept: number) => {
    const xValues = graphData.map((d) => d.x);
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);

    const yMin = slope * xMin + intercept;
    const yMax = slope * xMax + intercept;

    return [
      { x: xMin, y: yMin },
      { x: xMax, y: yMax },
    ];
  };

  const graphData = data?.getFilterCollectionData?.data
    ? transformData(data.getFilterCollectionData.data, paramX, paramY)
    : [];

  const analysisRes =
    graphType === "scatter"
      ? data?.getFilterCollectionData?.analysisRes ?? []
      : [];

  const { slope, intercept, R_squared } = analysisRes[0] || {};
  const lineData =
    slope && intercept ? validateAndTransformRegression(slope, intercept) : [];

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
    "x label": xLabel || paramX,
    "y label": yLabel || paramY,
  };

  const saveGraph = async () => {
    try {
      await addGeneratedGraphs({
        variables: {
          graphType: graphType,
          data: data?.getFilterCollectionData?.data ?? [],
          properties: [graphProperties],
          attributes: [paramX, paramY],
        },
      });
    } catch (error) {
      console.error("Error saving graph:", error);
    }
  };

  const handleRemoveGraph = async (graphId: number) => {
    try {
      await removeGraph({variables: { graphId }});
    } catch (error) {
      console.error("Error removing graph:", error);
    }
  };

  const handleGraphData = async () => {
    setSelectedGraph(false);
    setSelectedGraphType(null);
    setSelectedGraphData(null);
    setSelectedGraphProperties(null);
    setSelectedGraphType(null);
    setSubmit(true);
  };

  const handleGraphSelect = (graph: {
    data: any[];
    graphtype: string;
    properties: any;
    attributes: string[];
  }) => {
    setSubmit(false)
    const transformedData = transformData(graph.data, graph.attributes[0], graph.attributes[1]);
    setSelectedGraphType(graph.graphtype);
    setSelectedGraphData(transformedData);
    setSelectedGraphProperties(graph.properties[0]);
    setSelectedGraphType(graph.graphtype);
    setSelectedGraph(true);
  };

  React.useEffect(() => {
    if (!loading && !selectedGraph && submit) {
      saveGraph();
    }
  }, [loading, submit, data?.getFilterCollectionData?.data]);

  React.useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => resizeObserver.disconnect();
  }, []);

  return (
    <FormDataContext.Provider value={contextValue}>
      <div className="flex bg-white">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-200 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-200 blur-3xl"></div>
        <GraphSideBar
          onSubmit={handleGraphData}
          onGraphSelect={handleGraphSelect}
          deleteGraph={handleRemoveGraph}
          isOpen={isOpen}
          onToggleSidebar={setIsOpen}
          isModalOpen={isModalOpen}
          setIsModalOpen={setIsModalOpen}
        />
        <div
          className="transition-all duration-300 w-full"
          style={{
            maxWidth: `calc(100% - ${isOpen ? "18rem" : "5rem"})`,
          }}
        >
          <div className="p-8 h-full w-full flex items-center justify-center">
            {(submit || selectedGraph) && !isModalOpen && (
              <div className="w-full h-full max-w-[1200px] aspect-[4/3]">
                <div
                  ref={containerRef}
                  className={`relative w-full h-full p-4 bg-white rounded-lg shadow-lg transition-all duration-300 ${
                    (submit || selectedGraph) ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {loading && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg font-semibold text-blue-600 animate-pulse text-center">
                        Loading...
                      </p>
                    </div>
                  )}
                  {error && (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-lg font-semibold text-red-600 text-center">
                        Error: {error.message}
                      </p>
                    </div>
                  )}
                  {selectedGraphType === "bar" || graphType === "bar" ? (
                    <BarGraph
                      data={selectedGraph ? selectedGraphData : graphData}
                      properties={
                        selectedGraph
                          ? selectedGraphProperties
                          : graphProperties
                      }
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  ) : selectedGraphType === "line" || graphType === "line" ? (
                    <LineGraph
                      data={selectedGraph ? selectedGraphData : graphData}
                      properties={
                        selectedGraph ? selectedGraphProperties : graphData
                      }
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  ) : selectedGraphType === "scatter" ||
                    graphType === "scatter" ? (
                    <>
                      <div className="flex flex-col items-center justify-center">
                        <ScatterPlot
                          data={selectedGraph ? selectedGraphData : graphData}
                          properties={
                            selectedGraph
                              ? selectedGraphProperties
                              : graphProperties
                          }
                          width={dimensions.width}
                          height={dimensions.height}
                          lineData={lineData ? lineData : []}
                        />
                        {R_squared ? (
                          <div className="relative mt-2 p-2 text-center">
                            <h5 className="text-lg font-semibold text-gray-800">
                              Linear regression line: y = {slope.toFixed(2)}x +{" "}
                              {intercept.toFixed(2)}
                            </h5>
                            <h6 className="text-md font-medium text-gray-700 mt-1">
                              R<sup>2</sup> (coefficient of determination): {""}
                              {R_squared.toFixed(2)}
                            </h6>
                            {R_squared < 0.5 ? (
                              <p className="text-sm mt-2 text-gray-600">
                                The linear model explains less than 50% of the
                                variability in the data, suggesting a poor fit.
                              </p>
                            ) : (
                              <p className="text-sm mt-2 text-gray-600">
                                The linear model explains more than 50% of the
                                variability in the data, suggesting a moderate
                                to strong fit.
                              </p>
                            )}
                          </div>
                        ) : (
                          ""
                        )}
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </FormDataContext.Provider>
  );
};

export default DataVisualize;
