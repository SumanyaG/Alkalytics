// -----------------------------------------------------------------------------
// Primary Author: Jennifer Y
// Year: 2025
// Component: useGraphs
// Purpose: Custom hook for fetching and managing graph data.
// -----------------------------------------------------------------------------

import { gql, useQuery } from "@apollo/client";

const GET_GRAPH = gql`
  query GetLastestGraph($latest: Int) {
    getLastestGraph(latest: $latest)
  }
`;

const useGraphs = (latestNum: number) => {
  const { data: generatedGraphData, loading, error, refetch } = useQuery<{ getLastestGraph: any[] }>(
    GET_GRAPH,
    {
      variables: { latest: latestNum },
    }
  );

  const latestGraphs = generatedGraphData?.getLastestGraph ?? [];

  return { latestGraphs, loading, error, refetch }
};

export default useGraphs;
