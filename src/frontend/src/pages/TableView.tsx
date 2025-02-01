import React, { useState, useMemo } from "react";
import Table from "../components/table/Table";
import ListSidebar from "../components/sidebars/ListSidebar";
import { useQuery, gql } from "@apollo/client";

export const GET_EXPERIMENT_IDS = gql`
  query GetExperimentIds {
    getExperimentIds
  }
`;

const GET_EXPERIMENTS = gql`
  query GetExperiments {
    getExperiments
  }
`;

const GET_DATA = gql`
  query GetData($experimentId: String!) {
    getData(experimentId: $experimentId)
  }
`;

type TableViewProps = {};

const TableView: React.FC<TableViewProps> = () => {
  const {
    data: experimentIds,
    loading,
    error,
  } = useQuery<{ getExperimentIds: string[] }>(GET_EXPERIMENT_IDS);

  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(
    null
  );
  const [isOpen, setIsSidebarOpen] = useState(true);

  console.log(experimentIds);
  const {
    data: dataResponse,
    loading: dataLoading,
    error: dataError,
    refetch: refetchData,
  } = useQuery<{ getData: any[] }>(GET_DATA, {
    variables: { experimentId: selectedExperiment },
    skip: !selectedExperiment || selectedExperiment === "Exp",
  });

  const {
    data: experimentsResponse,
    loading: experimentsLoading,
    error: experimentsError,
    refetch: refetchExperiments,
  } = useQuery<{ getExperiments: any[] }>(GET_EXPERIMENTS, {
    skip: selectedExperiment !== "Exp",
  });

  const ids = experimentIds?.getExperimentIds ?? [];
  const experiments = experimentsResponse?.getExperiments ?? [];
  const data = dataResponse?.getData ?? [];

  const handleSelectExperiment = (experimentId: string) => {
    setSelectedExperiment(experimentId);
  };

  const sortedData = useMemo(() => {
    const dataToSort = selectedExperiment === "Exp" ? experiments : data;

    return [...dataToSort].sort((a, b) => {
      const aValue = Number(a["#"] ?? 0);
      const bValue = Number(b["#"] ?? 0);
      return aValue - bValue;
    });
  }, [selectedExperiment, data, experiments]);

  return (
    <div className="flex">
      <ListSidebar
        experimentIds={ids}
        selectedExperiment={selectedExperiment}
        onSelectExperiment={handleSelectExperiment}
        isOpen={isOpen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
      />
      <div
        className="transition-all duration-300 w-full"
        style={{
          maxWidth: `calc(100% - ${isOpen ? "18rem" : "5rem"})`,
        }}
      >
        <Table
          tableName={
            selectedExperiment === "Exp"
              ? experimentsLoading
                ? "Loading all experiments..."
                : experimentsError
                ? "Failed to fetch experiments."
                : "All Experiments"
              : dataLoading
              ? "Loading experiment data..."
              : dataError
              ? "Failed to fetch experiment data."
              : selectedExperiment ?? ""
          }
          data={sortedData}
          refetchData={
            selectedExperiment === "Exp" ? refetchExperiments : refetchData
          }
          graphType={selectedExperiment === "Exp" ? "experiment" : "data"}
        />
      </div>
    </div>
  );
};

export default TableView;
