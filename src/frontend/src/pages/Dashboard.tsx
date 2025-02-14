import useTable from "../hooks/useTable";
import Table from "../components/table/Table";
import BarGraph from "../components/graphs/bar-graph";
import ScatterPlot from "../components/graphs/scatter-plot";
import LineGraph from "../components/graphs/line-plot";
import useGraphs from "../hooks/useGraphs";

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
    <div className="flex flex-col p-4">
      <div className="flex flex-col flex-1 items-center justify-center h-screen max-w-full p-6">
        <div className="space-y-6">
          {/* GENERATED GRAPHS */}
          <div className="max-w-full p-6 mx-auto mb-6 rounded-lg bg-white shadow">
            <h2 className="ml-2 mb-4 text-2xl font-semibold text-blue-900">
              Generated Graphs
            </h2>
            <div className="ml-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 justify-between">
              {loading ? (
                <div className="w-full max-w-[25vw] aspect-square p-6 rounded-lg bg-white shadow">
                  <div className="flex items-center justify-center w-full h-full p-1 rounded-md bg-slate-200">
                    <p className="whitespace-normal text-ellipsis">
                      Loading...
                    </p>
                  </div>
                </div>
              ) : error ? (
                <div className="w-full max-w-[25vw] aspect-square p-6 rounded-lg bg-white shadow">
                  <div className="flex items-center justify-center w-full h-full p-1 rounded-md bg-slate-200">
                    <p className="whitespace-normal text-ellipsis">
                      Graphs cannot be displayed.
                    </p>
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
                      className="w-full max-w-[25vw] aspect-square p-2 rounded-lg bg-white shadow"
                    >
                      <div className="flex items-center justify-center w-full h-full rounded-md bg-white shadow-sm">
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
                          <p>Error rendering graph.</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="w-full max-w-[25vw] aspect-square p-6 rounded-lg bg-white shadow">
                  <div className="flex items-center justify-center w-full h-full p-1 rounded-md bg-slate-200">
                    <p className="whitespace-normal text-ellipsis">
                      Generate graphs to be displayed.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* DATA TABLE */}
          <div className="max-h-[70vw] min-h-[40vw] w-[90vw] p-0 mb-6 mx-auto rounded-lg bg-white shadow overflow-y-hidden">
            <select
              className="w-fit h-10 px-4 mt-6 mx-8 mb-0 rounded border font-medium border-gray-300"
              value={selectedExperiment}
              onChange={(e) => handleSelectExperiment(e.target.value)}
            >
              <option
                label="Select an experiment sheet to view"
                value="Exp"
                disabled={selectedExperiment !== "Exp"}
              ></option>
              <option
                label="All Experiments"
                value="Exp"
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
            <Table
              tableName={tableName}
              data={sortedData}
              refetchData={
                selectedExperiment === "Exp" ? refetchExperiments : refetchData
              }
              graphType={""}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
