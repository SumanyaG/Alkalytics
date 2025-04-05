// -----------------------------------------------------------------------------
// Primary Author: Jason T
// Year: 2025
// Component: useTable
// Purpose: Custom hook for managing table data and state.
// -----------------------------------------------------------------------------

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

const GET_EFFICIENCIES = gql`
  query GetEfficiencies {
    getEfficiencies
  }
`;

const useTable = (defaultExperiment: string) => {
  const {
    data: experimentIds,
  } = useQuery<{ getExperimentIds: string[] }>(GET_EXPERIMENT_IDS);

  const [selectedExperiment, setSelectedExperiment] = useState<string>(defaultExperiment);

  const {
    data: dataResponse,
    loading: dataLoading,
    error: dataError,
    refetch: refetchData,
  } = useQuery<{ getData: DataRow[] }>(GET_DATA, {
    variables: { experimentId: selectedExperiment },
    skip: selectedExperiment === "Experiment Log" || selectedExperiment === "Efficiency Calculations",
  });

  const {
    data: experimentsResponse,
    loading: experimentsLoading,
    error: experimentsError,
    refetch: refetchExperiments,
  } = useQuery<{ getExperiments: DataRow[] }>(GET_EXPERIMENTS, {
    skip: selectedExperiment !== "Experiment Log",
  });

  const {
    data: efficienciesResponse,
    loading: efficienciesLoading,
    error: efficienciesError,
    refetch: refetchEfficiencies,
  } = useQuery<{ getEfficiencies: DataRow[] }>(GET_EFFICIENCIES, {
      skip: selectedExperiment !== "Efficiency Calculations"
  })

  const ids = experimentIds?.getExperimentIds ?? [];
  const experiments = experimentsResponse?.getExperiments ?? [];
  const data = dataResponse?.getData ?? [];
  const efficiencyData = efficienciesResponse?.getEfficiencies ?? [];

  const handleSelectExperiment = (experimentId: string) => {
    setSelectedExperiment(experimentId);
  };

  const sortedData = useMemo(() => {
    const dataToSort =
      selectedExperiment === "Experiment Log"
        ? experiments
        : selectedExperiment === "Efficiency Calculations"
        ? efficiencyData
        : data;

    return [...dataToSort].sort((a, b) => {
      const aValue = Number(a["#"] ?? 0);
      const bValue = Number(b["#"] ?? 0);
      return aValue - bValue;
    });
  }, [selectedExperiment, data, experiments, efficiencyData]);

  const tableName =
    selectedExperiment === "Experiment Log"
      ? experimentsLoading
        ? "Loading all experiments..."
        : experimentsError
        ? "Failed to fetch experiments."
        : "All Experiments"
      : selectedExperiment === "Efficiency Calculations"
      ? efficienciesLoading
        ? "Loading efficiency calculations..."
        : efficienciesError
        ? "Failed to fetch efficiency calculations."
        : "Efficiency Calculations"
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
    refetchEfficiencies,
  };
};

export default useTable;
