import { useState, useEffect } from "react";
import useTable from "../hooks/useTable";
import Table from "../components/table/Table";
import BarGraph from "../components/graph/bar-graph";
import ScatterPlot from "../components/graph/scatter-plot";
import LineGraph from "../components/graph/line-plot";
import useGraphs from "../hooks/useGraphs";
// import { ChevronDown, BarChart3, LineChart, ScatterChart } from "lucide-react";

const Dashboard = () => {
  const {
    ids,
    selectedExperiment,
    sortedData,
    tableName,
    handleSelectExperiment,
    refetchData,
    refetchExperiments,
  } = useTable();

  const { latestGraphs, loading, error } = useGraphs(3);
  const validGraphs =
    latestGraphs?.filter((graph) => graph !== null && graph !== undefined) ??
    [];

  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [animateGraphs, setAnimateGraphs] = useState(false);

  useEffect(() => {
    // Trigger animation after component mounts
    setAnimateGraphs(true);
  }, []);

  const transformDataForScatter = (
    rawData: any[],
    selectedParamX: string,
    selectedParamY: string
  ) => {
    return rawData.map((item, index) => ({
      label: `Point ${index + 1}`,
      x: parseFloat(item[selectedParamX]),
      y: parseFloat(item[selectedParamY]),
    }));
  };

  const getGraphIcon = (type: string) => {
    return;
  };

  return (
    <div className="relative min-h-screen bg-white p-8">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-100 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1800px]">
        <h1 className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
          Dashboard
        </h1>

        <div className="space-y-8">
          {/* GENERATED GRAPHS */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300">
            <h2 className="mb-6 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
              Generated Graphs
            </h2>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {loading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div
                      key={i}
                      className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all duration-300"
                    >
                      <div className="flex h-full w-full animate-pulse items-center justify-center rounded-lg bg-blue-100">
                        <div className="text-blue-600/70">Loading...</div>
                      </div>
                    </div>
                  ))
              ) : error ? (
                <div className="group relative aspect-square overflow-hidden rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm transition-all duration-300">
                  <div className="flex h-full w-full items-center justify-center rounded-lg">
                    <div className="text-red-600">Error loading graphs</div>
                  </div>
                </div>
              ) : validGraphs.length > 0 ? (
                validGraphs.map((graph, index) => {
                  const { graphtype, data, properties, attributes } = graph;
                  const graphData = transformDataForScatter(
                    data,
                    attributes[0],
                    attributes[1]
                  );

                  return (
                    <div
                      key={index}
                      className={`group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-500 hover:shadow-md ${
                        animateGraphs
                          ? "opacity-100 translate-y-0"
                          : "opacity-0 translate-y-10"
                      }`}
                      style={{ transitionDelay: `${index * 150}ms` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                      <div className="absolute top-4 left-4 flex items-center space-x-2">
                        {/* {getGraphIcon(graphtype)} */}
                        <span className="text-sm font-bold text-blue-600">
                          {properties[0]?.["graph title"] ||
                            `${
                              graphtype.charAt(0).toUpperCase() +
                              graphtype.slice(1)
                            } Graph`}
                        </span>
                      </div>

                      <div className="flex h-full w-full items-center justify-center pt-8">
                        {graphtype === "bar" ? (
                          <BarGraph
                            data={graphData}
                            properties={properties[0]}
                            width={300}
                            height={300}
                          />
                        ) : graphtype === "line" ? (
                          <LineGraph
                            data={graphData}
                            properties={properties[0]}
                            width={300}
                            height={300}
                          />
                        ) : graphtype === "scatter" ? (
                          <ScatterPlot
                            data={graphData}
                            properties={properties[0]}
                            width={300}
                            height={300}
                            lineData={[]}
                          />
                        ) : (
                          <p className="text-red-600">Error rendering graph</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="group relative aspect-square overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm transition-all duration-300">
                  <div className="flex h-full w-full flex-col items-center justify-center rounded-lg">
                    {/* <BarChart3 className="mb-4 h-12 w-12 text-blue-600/30" /> */}
                    <div className="text-center text-blue-600/70">
                      No graphs generated yet
                    </div>
                    <p className="mt-2 text-center text-sm text-blue-600/50">
                      Generate graphs to visualize your data
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-md transition-all duration-300">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                Data Table
              </h2>

              <div className="relative">
                <button
                  onClick={() => setIsSelectOpen(!isSelectOpen)}
                  className="group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-blue-600 shadow-sm transition-all duration-200 hover:bg-gray-50"
                >
                  <span>
                    {selectedExperiment === "Exp"
                      ? "All Experiments"
                      : selectedExperiment}
                  </span>
                  {/* <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      isSelectOpen ? "rotate-180" : ""
                    }`}
                  /> */}
                  <span className="absolute bottom-0 left-0 h-[1px] w-0 bg-gradient-to-r from-blue-400 to-indigo-400 transition-all duration-300 group-hover:w-full"></span>
                </button>

                {isSelectOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          handleSelectExperiment("Exp");
                          setIsSelectOpen(false);
                        }}
                        className={`block w-full px-4 py-2 text-left text-sm ${
                          selectedExperiment === "Exp"
                            ? "bg-blue-600 text-white"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                      >
                        All Experiments
                      </button>

                      {ids.map((expSheet: string) => (
                        <button
                          key={expSheet}
                          onClick={() => {
                            handleSelectExperiment(expSheet);
                            setIsSelectOpen(false);
                          }}
                          className={`block w-full px-4 py-2 text-left text-sm ${
                            selectedExperiment === expSheet
                              ? "bg-blue-600 text-white"
                              : "text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {expSheet}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-[60vh] overflow-hidden">
              <Table
                tableName={tableName}
                data={sortedData}
                refetchData={
                  selectedExperiment === "Exp"
                    ? refetchExperiments
                    : refetchData
                }
                graphType={""}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
