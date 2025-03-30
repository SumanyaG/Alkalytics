import { useState, useEffect, useMemo } from "react";
import useTable from "../hooks/useTable";
import useGraphs from "../hooks/useGraphs";
import Table from "../components/table/Table";
import BarGraph from "../components/graph/bar-graph";
import ScatterPlot from "../components/graph/scatter-plot";
import LineGraph from "../components/graph/line-plot";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { sortedData, tableName, refetchData, refetchExperiments, refetchEfficiencies } = useTable("Efficiency Calculations");

  const { latestGraphs, loading, error } = useGraphs(3);
  const validGraphs = useMemo(
    () =>
      latestGraphs?.filter((graph) => graph !== null && graph !== undefined) ??
      [],
    [latestGraphs]
  );

  const [animateGraphs, setAnimateGraphs] = useState(false);
  const navigate = useNavigate();

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

  return (
    <div className="relative min-h-screen bg-white p-8">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-100 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-[1800px]">
        <div className="space-y-8">
          {/* WELCOME HEADER */}
          <div className="flex flex-col items-center text-center mt-4 mb-8">
            <h1 className="text-4xl font-extrabold text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text animate-fade-in">
              Welcome to Your Dashboard
            </h1>
            <p className="mt-4 text-base text-gray-600 max-w-2xl">
              Explore your data, analyze trends, and visualize insights.
            </p>
          </div>
          {/* GENERATED GRAPHS */}
          <div className="rounded-2xl border border-gray-200 bg-transparent px-6 py-4 shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                Generated Graphs
              </h2>
              <button
                onClick={() => navigate("/graphs")}
                className="mb-4 group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-blue-600 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none"
              >
                <span className="text-sm font-semibold group-hover:text-blue-700">
                  View All
                </span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 group-hover:text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>

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
                      <div className="absolute z-50 inset-0 bg-gradient-to-br from-blue-100 to-indigo-100 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

                      <div className="z-40 absolute top-3.5 left-1/2 transform -translate-x-1/2">
                        <span className="text-base font-bold text-black">
                          {properties[0]?.["graph title"] !== ""
                            ? ""
                            : `${
                                graphtype.charAt(0).toUpperCase() +
                                graphtype.slice(1)
                              } Graph`}
                        </span>
                      </div>

                      <div className="flex h-full w-full items-center justify-center">
                        {graphtype === "bar" ? (
                          <BarGraph
                            data={graphData}
                            properties={properties[0]}
                            width={400}
                            height={400}
                          />
                        ) : graphtype === "line" ? (
                          <LineGraph
                            data={graphData}
                            properties={properties[0]}
                            width={400}
                            height={400}
                          />
                        ) : graphtype === "scatter" ? (
                          <ScatterPlot
                            data={graphData}
                            properties={properties[0]}
                            width={400}
                            height={400}
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
          <div className="rounded-2xl border border-gray-200 bg-transparent px-6 py-4 shadow-md transition-all duration-300">
            <div className="flex items-center justify-between">
              <h2 className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold text-transparent">
                Data Analysis
              </h2>
              <button
                className="group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-blue-600 shadow-sm transition-all duration-200 hover:scale-105 hover:bg-gray-50 focus:outline-none"
                onClick={() => navigate("/table")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-blue-600 group-hover:text-blue-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
                <span className="text-sm font-semibold group-hover:text-blue-700">
                  View All Data
                </span>
              </button>

              {/* <div className="relative">
                <select
                  value={selectedExperiment}
                  onChange={(e) => handleSelectExperiment(e.target.value)}
                  className="appearance-none group flex items-center space-x-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-blue-600 shadow-sm transition-all duration-200 hover:bg-gray-50 focus:outline-none"
                >
                  <option
                    label="Select an experiment to view"
                    value="Exp"
                    disabled={selectedExperiment !== "Exp"}
                  ></option>
                  <option
                    value="Exp"
                    label="All Experiments"
                    disabled={selectedExperiment === "Exp"}
                  >
                    All Experiments
                  </option>
                  {ids.map((expSheet: string) => (
                    <option key={expSheet} value={expSheet}>
                      {expSheet}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>

            <div className="-mx-9 -my-4">
              <Table
                tableName={tableName}
                data={sortedData}
                refetchData={refetchData}
                refetchExperiments={refetchExperiments}
                refetchEfficiencies={refetchEfficiencies}
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
