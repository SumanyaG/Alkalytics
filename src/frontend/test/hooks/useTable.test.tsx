import { renderHook, act, waitFor } from "@testing-library/react";
import { MockedProvider } from "@apollo/client/testing";
import { OperationVariables } from "@apollo/client";
import useTable from "../../src/hooks/useTable";
import { DataRow } from "../../src/components/table/Table";

import { gql } from "@apollo/client";
import React from "react";

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

const mockExperimentIds = ["Exp1", "Exp2", "Exp3"];
const mockExperiments: DataRow[] = [
  { "#": "2", name: "Experiment 2", date: "2023-02-01" },
  { "#": "1", name: "Experiment 1", date: "2023-01-01" },
  { "#": "3", name: "Experiment 3", date: "2023-03-01" },
];
const mockData: DataRow[] = [
  { "#": "3", value: "15", timestamp: "2023-03-01" },
  { "#": "1", value: "10", timestamp: "2023-01-01" },
  { "#": "2", value: "20", timestamp: "2023-02-01" },
];

const mocks = [
  {
    request: {
      query: GET_EXPERIMENT_IDS,
    },
    result: {
      data: {
        getExperimentIds: mockExperimentIds,
      },
    },
  },
  {
    request: {
      query: GET_EXPERIMENTS,
    },
    result: {
      data: {
        getExperiments: mockExperiments,
      },
    },
  },
  {
    request: {
      query: GET_DATA,
      variables: { experimentId: "Exp1" },
    },
    result: {
      data: {
        getData: mockData,
      },
    },
  },
];

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <MockedProvider mocks={mocks} addTypename={false}>
    {children}
  </MockedProvider>
);

describe("useTable Hook", () => {
  test("should initialize with default values", async () => {
    const { result } = renderHook(() => useTable(), { wrapper });

    expect(result.current.selectedExperiment).toBe("Exp");
    expect(result.current.ids).toEqual([]);
    expect(result.current.sortedData).toEqual([]);
    expect(result.current.tableName).toBe("Loading all experiments...");

    await waitFor(() => {
      expect(result.current.ids).toEqual(mockExperimentIds);
    });

    await waitFor(() => {
      expect(result.current.sortedData.length).toBe(3);
      expect(result.current.tableName).toBe("All Experiments");
    });

    expect(result.current.sortedData).toEqual([
      { "#": "1", name: "Experiment 1", date: "2023-01-01" },
      { "#": "2", name: "Experiment 2", date: "2023-02-01" },
      { "#": "3", name: "Experiment 3", date: "2023-03-01" },
    ]);
  });

  test("GET_EXPERIMENT_IDS query should fetch experiment IDs correctly", async () => {
    const idsMock = [
      {
        request: {
          query: GET_EXPERIMENT_IDS,
        },
        result: {
          data: {
            getExperimentIds: mockExperimentIds,
          },
        },
      },
    ];

    const wrapper = ({ children }: any) => (
      <MockedProvider mocks={idsMock} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useTable(), { wrapper });

    expect(result.current.ids).toEqual([]);

    await waitFor(() => {
      expect(result.current.ids).toEqual(mockExperimentIds);
    });

    expect(result.current.ids.length).toBe(3);
    expect(result.current.ids[0]).toBe("Exp1");
    expect(result.current.ids[1]).toBe("Exp2");
    expect(result.current.ids[2]).toBe("Exp3");
  });

  test("GET_EXPERIMENTS query should fetch and sort experiments correctly", async () => {
    const experimentsMock = [
      {
        request: {
          query: GET_EXPERIMENT_IDS,
        },
        result: {
          data: {
            getExperimentIds: mockExperimentIds,
          },
        },
      },
      {
        request: {
          query: GET_EXPERIMENTS,
        },
        result: {
          data: {
            getExperiments: mockExperiments,
          },
        },
      },
    ];

    const wrapper = ({ children }: any) => (
      <MockedProvider mocks={experimentsMock} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useTable(), { wrapper });

    await waitFor(() => {
      expect(result.current.tableName).toBe("All Experiments");
    });

    expect(result.current.sortedData.length).toBe(3);

    expect(result.current.sortedData[0]["#"]).toBe("1");
    expect(result.current.sortedData[1]["#"]).toBe("2");
    expect(result.current.sortedData[2]["#"]).toBe("3");

    expect(result.current.sortedData[0].name).toBe("Experiment 1");
    expect(result.current.sortedData[1].name).toBe("Experiment 2");
    expect(result.current.sortedData[2].name).toBe("Experiment 3");
  });

  test("GET_DATA query should fetch experiment data correctly when experiment is selected", async () => {
    const dataMock = [
      {
        request: {
          query: GET_EXPERIMENT_IDS,
        },
        result: {
          data: {
            getExperimentIds: mockExperimentIds,
          },
        },
      },
      {
        request: {
          query: GET_DATA,
          variables: { experimentId: "Exp2" },
        },
        result: {
          data: {
            getData: mockData,
          },
        },
      },
    ];

    const wrapper = ({ children }: any) => (
      <MockedProvider mocks={dataMock} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useTable(), { wrapper });

    await waitFor(() => {
      expect(result.current.ids.length).toBe(3);
    });

    act(() => {
      result.current.handleSelectExperiment("Exp2");
    });

    expect(result.current.selectedExperiment).toBe("Exp2");
    expect(result.current.tableName).toBe("Loading experiment data...");

    await waitFor(() => {
      expect(result.current.tableName).toBe("Exp2");
    });

    expect(result.current.sortedData.length).toBe(3);

    expect(result.current.sortedData[0]["#"]).toBe("1");
    expect(result.current.sortedData[1]["#"]).toBe("2");
    expect(result.current.sortedData[2]["#"]).toBe("3");

    expect(result.current.sortedData[0].value).toBe("10");
    expect(result.current.sortedData[1].value).toBe("20");
    expect(result.current.sortedData[2].value).toBe("15");
  });

  test("should change experiment and fetch data when handleSelectExperiment is called", async () => {
    const { result } = renderHook(() => useTable(), { wrapper });

    await waitFor(() => {
      expect(result.current.ids.length).toBe(3);
    });

    await waitFor(() => {
      expect(result.current.tableName).toBe("All Experiments");
    });

    act(() => {
      result.current.handleSelectExperiment("Exp1");
    });

    expect(result.current.selectedExperiment).toBe("Exp1");
    expect(result.current.tableName).toBe("Loading experiment data...");

    await waitFor(() => {
      expect(result.current.tableName).toBe("Exp1");
    });

    expect(result.current.sortedData).toEqual([
      { "#": "1", value: "10", timestamp: "2023-01-01" },
      { "#": "2", value: "20", timestamp: "2023-02-01" },
      { "#": "3", value: "15", timestamp: "2023-03-01" },
    ]);
  });

  test("should handle refetching data", async () => {
    const { result } = renderHook(() => useTable(), { wrapper });

    await waitFor(() => {
      expect(result.current.ids.length).toBe(3);
    });

    await waitFor(() => {
      expect(result.current.tableName).toBe("All Experiments");
    });

    const refetchExperimentsSpy = jest.spyOn(
      result.current,
      "refetchExperiments"
    );
    act(() => {
      result.current.refetchExperiments();
    });
    expect(refetchExperimentsSpy).toHaveBeenCalled();

    act(() => {
      result.current.handleSelectExperiment("Exp1");
    });

    await waitFor(() => {
      expect(result.current.tableName).toBe("Exp1");
    });

    const refetchDataSpy = jest.spyOn(result.current, "refetchData");
    act(() => {
      result.current.refetchData();
    });
    expect(refetchDataSpy).toHaveBeenCalled();
  });

  test("should handle Apollo error states", async () => {
    const errorMocks = [
      {
        request: {
          query: GET_EXPERIMENT_IDS,
        },
        error: new Error("Failed to fetch experiment IDs"),
      },
      {
        request: {
          query: GET_EXPERIMENTS,
        },
        error: new Error("Failed to fetch experiments"),
      },
    ];

    const errorWrapper = ({ children }: { children: React.ReactNode }) => (
      <MockedProvider mocks={errorMocks} addTypename={false}>
        {children}
      </MockedProvider>
    );

    const { result } = renderHook(() => useTable(), { wrapper: errorWrapper });

    await waitFor(() => {
      expect(result.current.tableName).toBe("Failed to fetch experiments.");
    });

    expect(result.current.ids).toEqual([]);
  });
});
