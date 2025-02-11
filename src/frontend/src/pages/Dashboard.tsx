import useTable from "../hooks/useTable";
import Table from "../components/table/Table";
import { useQuery, gql } from "@apollo/client";
import BarGraph from "../components/graphs/bar-graph";
import ScatterPlot from "../components/graphs/scatter-plot";
import LineGraph from "../components/graphs/line-plot";

const GET_GRAPH = gql`
  query GetLastestGraph($latest: Int) {
    getLastestGraph(latest: $latest)
  }
`;

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

  const { data: generatedGraphData } = useQuery<{ getLastestGraph: any[] }>(
    GET_GRAPH,
    {
      variables: { latest: 3 },
    }
  );

  const latestGraphs = generatedGraphData?.getLastestGraph ?? [];

  return (
    <div className="flex flex-col p-4">
      <div className="flex flex-col flex-1 items-center justify-center h-screen max-w-full p-6">
        <div className="space-y-6">
          {/* GENERATED GRAPHS */}
          <div className="max-w-full p-6 mx-auto mb-6 rounded-lg bg-white shadow">
            <h2 className="mb-4 text-2xl font-semibold text-blue-900">
              Generated Graphs
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* GRAPH WIDGETS WIP */}
              <div className="h-80 p-6 rounded-lg bg-white shadow">
                <div className="flex items-center justify-center h-full rounded-md bg-slate-200">
                  <p>graph placeholder</p>
                </div>
              </div>

              <div className="h-80 p-6 rounded-lg bg-white shadow">
                <div className="flex items-center justify-center h-full rounded-md bg-slate-200">
                  <p>graph placeholder</p>
                </div>
              </div>

              <div className="h-80 p-6 rounded-lg bg-white shadow">
                <div className="flex items-center justify-center h-full rounded-md bg-slate-200">
                  <p>graph placeholder</p>
                </div>
              </div>
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
