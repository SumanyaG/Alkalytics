import { useState, useMemo } from "react";
import { useQuery, gql } from "@apollo/client";
import { DataRow } from "../components/table/Table";

const GET_EXPERIMENT_IDS = gql`
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

const useTable = () => {
  const {
    data: experimentIds,
    loading,
    error,
  } = useQuery<{ getExperimentIds: string[] }>(GET_EXPERIMENT_IDS);

  const [selectedExperiment, setSelectedExperiment] = useState<string>("Exp");

  const {
    data: dataResponse,
    loading: dataLoading,
    error: dataError,
    refetch: refetchData,
  } = useQuery<{ getData: DataRow[] }>(GET_DATA, {
    variables: { experimentId: selectedExperiment },
    skip: selectedExperiment === "Exp",
  });

  const {
    data: experimentsResponse,
    loading: experimentsLoading,
    error: experimentsError,
    refetch: refetchExperiments,
  } = useQuery<{ getExperiments: DataRow[] }>(GET_EXPERIMENTS, {
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

  const tableName =
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
      : selectedExperiment;

  return {
    ids,
    selectedExperiment,
    sortedData,
    tableName,
    handleSelectExperiment,
    refetchData,
    refetchExperiments,
  };
};

export default useTable;
