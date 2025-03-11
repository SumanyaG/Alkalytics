import { renderHook, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";

import useGraphs from "../../src/hooks/useGraphs";

import { gql } from "@apollo/client";
import React from "react";

const GET_GRAPH = gql`
  query GetLastestGraph($latest: Int) {
    getLastestGraph(latest: $latest)
  }
`;

const mockGraphs = [
  {
    id: "1",
    graphtype: "bar",
    data: ["test"],
    properties: ["title"],
    attributes: ["a", "b"],
  },
  {
    id: "2",
    graphtype: "line",
    data: ["test"],
    properties: ["title"],
    attributes: ["a", "b"],
  },
  {
    id: "3",
    graphtype: "scatter",
    data: ["test"],
    properties: ["title"],
    attributes: ["a", "b"],
  },
];

const mocks = [
  {
    request: {
      query: GET_GRAPH,
      variable: { latest: 0 },
    },
    result: {
      data: {
        getLastestGraph: mockGraphs,
      },
    },
  },
  {
    request: {
      query: GET_GRAPH,
      variable: { latest: 1 },
    },
    result: {
      data: {
        getLastestGraph: mockGraphs[0],
      },
    },
  },
];

describe("useGraphs", () => {
  it("should fetch multiple graphs when latest=0", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useGraphs(0), { wrapper });

    // Initial loading state
    expect(result.current).toEqual({
      latestGraphs: [],
      loading: true,
      error: undefined,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toEqual({
      latestGraphs: mockGraphs,
      loading: false,
      error: undefined,
    });
  });

  it("should fetch single graph when latest=1", async () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={mocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useGraphs(1), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toEqual({
      latestGraphs: [mockGraphs[0]],
      loading: false,
      error: undefined,
    });
  });

  it("should handle network errors", async () => {
    const errorMock = {
      request: {
        query: GET_GRAPH,
        variables: { latest: 2 },
      },
      error: new Error("Network Error"),
    };

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={[errorMock]} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useGraphs(2), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current).toEqual({
      latestGraphs: [],
      loading: false,
      error: errorMock.error,
    });
  });
});
