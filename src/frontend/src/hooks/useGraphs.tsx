import { gql, useQuery } from "@apollo/client";

const GET_GRAPH = gql`
  query GetLastestGraph($latest: Int) {
    getLastestGraph(latest: $latest)
  }
`;

const useGraphs = (latestNum: number) => {
  const { data: generatedGraphData, loading, error } = useQuery<{ getLastestGraph: any[] }>(
    GET_GRAPH,
    {
      variables: { latest: latestNum },
    }
  );

  const latestGraphs = generatedGraphData?.getLastestGraph ?? [];

  return { latestGraphs, loading, error }
};

export default useGraphs;
