import { useState } from "react";
import { useQuery, gql } from "@apollo/client";

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
  const { data: experimentIds } = useQuery<{ getExperimentIds: string[] }>(
    GET_EXPERIMENT_IDS
  );

  const [selectedExperiment, setSelectedExperiment] = useState<string | null>(
    null
  );

  const {
    data: dataResponse,
    loading: dataLoading,
    error: dataError,
  } = useQuery(GET_DATA, {
    variables: { experimentId: selectedExperiment },
    skip: selectedExperiment === "Exp" || !selectedExperiment,
  });

  const {
    data: experimentsResponse,
    loading: experimentsLoading,
    error: experimentsError,
  } = useQuery(GET_EXPERIMENTS, {
    skip: !!selectedExperiment && selectedExperiment !== "Exp",
  });

  const ids = experimentIds?.getExperimentIds ?? [];
  const experiments = experimentsResponse?.getExperiments ?? [];
  const data = dataResponse?.getData ?? [];

  const handleSelectExperiment = (experimentId: string) => {
    setSelectedExperiment(experimentId);
  };

  return {
    ids,
    experiments,
    data,
    selectedExperiment,
    experimentsLoading,
    experimentsError,
    dataLoading,
    dataError,
    handleSelectExperiment,
  };
};

export default useTable;
