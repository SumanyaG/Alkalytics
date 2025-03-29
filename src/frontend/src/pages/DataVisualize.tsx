import React, { useState, useRef } from "react";
import GraphSideBar from "../components/sidebar/GraphSideBar";
import ScatterPlot from "../components/graph/scatter-plot";
import LineGraph from "../components/graph/line-plot";
import BarGraph from "../components/graph/bar-graph";
import { useQuery, gql, useMutation } from "@apollo/client";

type FormDataType = {
  selectedGraphType: string;
  setSelectedGraphType: (value: string) => void;
  selectedFilterParamType: string;
  setSelectedFilterParamType: (value: string) => void;
  selectedFilterParam: string;
  setSelectedFilterParam: (value: string) => void;
  selectedFilterValue: string;
  setSelectedFilterValue: (value: string) => void;
  selectedParamType: string;
  setSelectedParamType: (value: string) => void;
  selectedParamX: string;
  setSelectedParamX: (value: string) => void;
  selectedParamY: string;
  setSelectedParamY: (value: string) => void;
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
  selectedGraphType: "",
  setSelectedGraphType: () => {},
  selectedFilterParamType: "",
  setSelectedFilterParamType: () => {},
  selectedFilterParam: "",
  setSelectedFilterParam: () => {},
  selectedFilterValue: "",
  setSelectedFilterValue: () => {},
  selectedParamType: "",
  setSelectedParamType: () => {},
  selectedParamX: "",
  setSelectedParamX: () => {},
  selectedParamY: "",
  setSelectedParamY: () => {},
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
    $collection: String!
    $attributes: [String!]!
    $xValue: String
    $yValue: String
    $getDate: Boolean
    $analysis: Boolean
  ) {
    getFilterCollectionData(
      attributes: $attributes
      collection: $collection
      xValue: $xValue
      yValue: $yValue
      getDate: $getDate
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
  const [selectedGraphType, setSelectedGraphType] = useState<string>("");
  const [selectedFilterParamType, setSelectedFilterParamType] =
    useState<string>("");
  const [selectedFilterParam, setSelectedFilterParam] = useState<string>("");
  const [selectedFilterValue, setSelectedFilterValue] = useState<string>("");
  const [selectedParamType, setSelectedParamType] = useState<string>("");
  const [selectedParamX, setSelectedParamX] = useState<string>("");
  const [selectedParamY, setSelectedParamY] = useState<string>("");
  const [xValue, setXValue] = useState<string>("");
  const [yValue, setYValue] = useState<string>("");
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
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
  const [selectedGraphData, setSelectedGraphData] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const containerRef = useRef<HTMLDivElement>(null);

  const contextValue: FormDataType = {
    selectedGraphType,
    setSelectedGraphType,
    selectedFilterParamType,
    setSelectedFilterParamType,
    selectedFilterParam,
    setSelectedFilterParam,
    selectedFilterValue,
    setSelectedFilterValue,
    selectedParamType,
    setSelectedParamType,
    selectedParamX,
    setSelectedParamX,
    selectedParamY,
    setSelectedParamY,
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
  const [removeGraph] = useMutation(REMOVE_GRAPH);
  const handleRemoveGraph = async (graphId: number) => {
    try {
      const { data } = await removeGraph({
        variables: { graphId },
      });
    } catch (error) {
      console.error("Error removing graph:", error);
    }
  };

  const { data, loading, error } = useQuery<{
    getFilterCollectionData: {
      data: any[];
      analysisRes?: any[];
    };
  }>(FILTER_COLLECTDATA, {
    variables: {
      attributes: [selectedParamX, selectedParamY],
      collection: selectedParamType,
      analysis: selectedGraphType === "scatter",
    },
    skip: !submit,
  });

  const transformDataForScatter = (rawData: any[]) => {
    return rawData.map((item, index) => ({
      label: `Point ${index + 1}`,
      x: parseFloat(item[selectedParamX]),
      y: parseFloat(item[selectedParamY]),
    }));
  };

  const graphData = data?.getFilterCollectionData?.data
    ? transformDataForScatter(data.getFilterCollectionData.data)
    : [];

  const validateAndTransformAnalysis = (slope: number, intercept: number) => {
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

  const analysisRes =
    selectedGraphType === "scatter"
      ? data?.getFilterCollectionData?.analysisRes ?? []
      : [];

  const { slope, intercept, R_squared } = analysisRes[0] || {};
  const lineData =
    slope && intercept ? validateAndTransformAnalysis(slope, intercept) : [];

  const [addGeneratedGraphs] = useMutation(SAVE_GRAPH);

  const graphProperties = {
    "graph title": graphTitle,
    "x time min": timeMinX ? parseFloat(timeMinX) : undefined,
    "x time max": timeMaxX ? parseFloat(timeMaxX) : undefined,
    "y time min": timeMinY ? parseFloat(timeMinY) : undefined,
    "y time max": timeMaxY ? parseFloat(timeMaxY) : undefined,
    "min x": minX ? parseFloat(minX) : undefined,
    "max x": maxX ? parseFloat(maxX) : undefined,
    "min y": minY ? parseFloat(minY) : undefined,
    "max y": maxY ? parseFloat(maxY) : undefined,
    "x label": xLabel || selectedParamX,
    "y label": yLabel || selectedParamY,
  };

  const saveGraph = async () => {
    try {
      await addGeneratedGraphs({
        variables: {
          graphType: selectedGraphType,
          data: data?.getFilterCollectionData?.data ?? [],
          properties: [graphProperties],
          attributes: [selectedParamX, selectedParamY],
        },
      });
    } catch (error) {
      console.error("Error saving graph:", error);
    }
  };

  const handleGraphData = async () => {
    setSubmit(true);
  };

  const handleGraphSelect = (graphData: any) => {
    const transformedData = graphData.data
      ? transformDataForScatter(graphData.data)
      : [];
    setSelectedGraphData(transformedData);
    setSubmit(true);
  };

  React.useEffect(() => {
    if (!loading && !selectedGraphData && submit) {
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
      <div className="relative flex min-h-screen bg-white">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-200 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-200 blur-3xl"></div>
        <GraphSideBar
          onSubmit={handleGraphData}
          onGraphSelect={handleGraphSelect}
          deleteGraph={handleRemoveGraph}
        />
        <div className="flex-1 overflow-hidden">
          <div className="p-8 h-full w-full flex items-center justify-center">
            {loading && <p>Loading...</p>}
            {error && <p>Error: {error.message}</p>}
            {submit && (
              <div className="w-full h-full max-w-[1200px] aspect-[4/3]">
                <div
                  ref={containerRef}
                  className="relative w-full h-full p-4 bg-white rounded-lg shadow-lg"
                >
                  {selectedGraphType === "bar" ? (
                    <BarGraph
                      data={selectedGraphData?.data || graphData}
                      properties={graphProperties}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  ) : selectedGraphType === "line" ? (
                    <LineGraph
                      data={selectedGraphData?.data || graphData}
                      properties={graphProperties}
                      width={dimensions.width}
                      height={dimensions.height}
                    />
                  ) : selectedGraphType === "scatter" ? (
                    <>
                      <ScatterPlot
                        data={selectedGraphData?.data || graphData}
                        properties={graphProperties}
                        width={dimensions.width}
                        height={dimensions.height}
                        lineData={lineData}
                      />
                      {R_squared ? (
                        <div className="relative mt-2 p-2">
                          <h6>
                            R<sup>2</sup> (coefficient of determination): {""}
                            {R_squared.toFixed(2)}
                          </h6>
                          {R_squared < 0.5 ? (
                            <p>
                              The linear model explains less than 50% of the
                              variability in the data, suggesting a poor fit.
                            </p>
                          ) : (
                            <p>
                              The linear model explains more than 50% of the
                              variability in the data, suggesting a moderate to
                              strong fit.
                            </p>
                          )}
                        </div>
                      ) : (
                        ""
                      )}
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
