import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MockedProvider } from "@apollo/client/testing";
import Table, {
  ADD_COLUMN,
  ADD_ROW,
  REMOVE_COLUMN,
  REMOVE_ROW,
  UPDATE_DATA,
  SET_COLUMN_TYPES,
} from "../../../src/components/table/Table";

// Mock child components
jest.mock("../../../src/components/table/TableBody", () => ({
  __esModule: true,
  default: jest.fn(
    ({
      columns,
      data,
      highlightKeyword,
      selectedRows,
      setSelectedRows,
      onUpdateCell,
    }) => (
      <div data-testid="table-body">
        {data.map((row: any, index: any) => (
          <div key={index} data-testid="table-row">
            <input
              type="checkbox"
              checked={selectedRows.has(String(row.experimentId))}
              onChange={() => setSelectedRows(row)}
              data-testid={`row-checkbox-${row.experimentId}`}
            />
            {columns.map((col: any) => (
              <span
                key={col}
                data-testid={`cell-${index}-${col}`}
                onClick={() =>
                  onUpdateCell({
                    experimentId: row.experimentId,
                    [col]: "updated value",
                  })
                }
              >
                {String(row[col] || "")}
              </span>
            ))}
          </div>
        ))}
      </div>
    )
  ),
}));

jest.mock("../../../src/components/table/TableHeader", () => ({
  __esModule: true,
  default: jest.fn(
    ({
      searchKeyword,
      setSearchKeyword,
      selectedColumn,
      setSelectedColumn,
      onSetColumnTypes,
      tableName,
    }) => (
      <div data-testid="table-header">
        <h2>{tableName}</h2>
        <select
          data-testid="column-select"
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
        >
          <option value="">All Columns</option>
        </select>
        <input
          data-testid="search-input"
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
        />
        <button data-testid="set-column-types-btn" onClick={onSetColumnTypes}>
          Set Column Types
        </button>
      </div>
    )
  ),
}));

jest.mock("../../../src/components/table/TableFooter", () => ({
  __esModule: true,
  default: jest.fn(
    ({
      onAddColumn,
      onAddRow,
      onRemoveColumn,
      onRemoveRow,
      selectedRows,
      onApplyFunction,
    }) => (
      <div data-testid="table-footer">
        <button data-testid="add-column-btn" onClick={onAddColumn}>
          Add Column
        </button>
        <button data-testid="add-row-btn" onClick={onAddRow}>
          Add Row
        </button>
        <button data-testid="remove-column-btn" onClick={onRemoveColumn}>
          Remove Column
        </button>
        <button
          data-testid="remove-row-btn"
          onClick={onRemoveRow}
          disabled={selectedRows.size === 0}
        >
          Remove Row ({selectedRows.size})
        </button>
        <button
          data-testid="apply-function-btn"
          onClick={() => onApplyFunction({ function: "test" })}
        >
          Apply Function
        </button>
      </div>
    )
  ),
}));

jest.mock("../../../src/components/modal/AddColumnModal", () => ({
  __esModule: true,
  default: jest.fn(({ setIsModalOpen, onAddColumn }) => (
    <div data-testid="add-column-modal">
      <button
        data-testid="submit-add-column"
        onClick={() => {
          onAddColumn("newColumn", "");
          setIsModalOpen(false);
        }}
      >
        Add Column
      </button>
      <button
        data-testid="cancel-add-column"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
    </div>
  )),
}));

jest.mock("../../../src/components/modal/AddRowModal", () => ({
  __esModule: true,
  default: jest.fn(({ setIsModalOpen, onAddRow }) => (
    <div data-testid="add-row-modal">
      <button
        data-testid="submit-add-row"
        onClick={() => {
          onAddRow({ experimentId: "new-id", col1: "value1" });
        }}
      >
        Add Row
      </button>
      <button
        data-testid="cancel-add-row"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
    </div>
  )),
}));

jest.mock("../../../src/components/modal/RemoveColumnModal", () => ({
  __esModule: true,
  default: jest.fn(({ setIsModalOpen, onRemoveColumn }) => (
    <div data-testid="remove-column-modal">
      <button
        data-testid="submit-remove-column"
        onClick={() => {
          onRemoveColumn("col1");
          setIsModalOpen(false);
        }}
      >
        Remove Column
      </button>
      <button
        data-testid="cancel-remove-column"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
    </div>
  )),
}));

jest.mock("../../../src/components/modal/RemoveRowModal", () => ({
  __esModule: true,
  default: jest.fn(({ setIsModalOpen, onRemoveRow, selectedRows }) => (
    <div data-testid="remove-row-modal">
      <button
        data-testid="submit-remove-row"
        onClick={() => {
          onRemoveRow(Array.from(selectedRows));
          setIsModalOpen(false);
        }}
      >
        Remove {selectedRows.size} Row(s)
      </button>
      <button
        data-testid="cancel-remove-row"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
    </div>
  )),
}));

jest.mock("../../../src/components/modal/SetColumnTypesModal", () => ({
  __esModule: true,
  default: jest.fn(({ setIsModalOpen, onUpdateColumnTypes }) => (
    <div data-testid="set-column-types-modal">
      <button
        data-testid="submit-column-types"
        onClick={() => {
          onUpdateColumnTypes({ col1: "number", col2: "text" });
          setIsModalOpen(false);
        }}
      >
        Set Types
      </button>
      <button
        data-testid="cancel-column-types"
        onClick={() => setIsModalOpen(false)}
      >
        Cancel
      </button>
    </div>
  )),
}));

// Sample mock data
const mockData = [
  { experimentId: "exp1", "#": 1, Date: "2023-01-01", Membrane: "Type A" },
  { experimentId: "exp2", "#": 2, Date: "2023-01-02", Membrane: "Type B" },
  { experimentId: "exp3", "#": 3, Date: "2023-01-03", Membrane: "Type C" },
];

// GraphQL mocks
const mocks = [
  {
    request: {
      query: ADD_COLUMN,
      variables: { columnName: "newColumn", defaultValue: "" },
    },
    result: {
      data: { addColumn: true },
    },
  },
  {
    request: {
      query: ADD_ROW,
      variables: { rowData: { experimentId: "new-id", col1: "value1" } },
    },
    result: {
      data: { addRow: true },
    },
  },
  {
    request: {
      query: REMOVE_COLUMN,
      variables: { columnName: "col1" },
    },
    result: {
      data: { removeColumn: true },
    },
  },
  {
    request: {
      query: REMOVE_ROW,
      variables: { experimentIds: ["exp1"] },
    },
    result: {
      data: { removeRow: true },
    },
  },
  {
    request: {
      query: UPDATE_DATA,
      variables: {
        updatedData: { experimentId: "exp1", "#": "updated value" },
      },
    },
    result: {
      data: { updateData: true },
    },
  },
  {
    request: {
      query: UPDATE_DATA,
      variables: { updatedData: { function: "test" } },
    },
    result: {
      data: { updateData: true },
    },
  },
  {
    request: {
      query: SET_COLUMN_TYPES,
      variables: { newColumnTypes: { col1: "number", col2: "text" } },
    },
    result: {
      data: { setColumnTypes: true },
    },
  },
];

describe("Table Component", () => {
  const refetchDataMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the table with provided data", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    expect(screen.getByTestId("table-header")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
    expect(screen.getByTestId("table-footer")).toBeInTheDocument();
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  it("filters data based on search keyword", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Simulate searching
    const searchInput = screen.getByTestId("search-input");
    fireEvent.change(searchInput, { target: { value: "Type A" } });

    // Wait for debounced search to take effect
    await waitFor(
      () => {
        expect(screen.getAllByTestId("table-row")).toHaveLength(1);
      },
      { timeout: 500 }
    );
  });

  it("shows and handles add column modal", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Open modal
    fireEvent.click(screen.getByTestId("add-column-btn"));
    expect(screen.getByTestId("add-column-modal")).toBeInTheDocument();

    // Submit modal
    fireEvent.click(screen.getByTestId("submit-add-column"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("shows and handles add row modal", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Open modal
    fireEvent.click(screen.getByTestId("add-row-btn"));
    expect(screen.getByTestId("add-row-modal")).toBeInTheDocument();

    // Submit modal
    fireEvent.click(screen.getByTestId("submit-add-row"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("shows and handles remove column modal", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Open modal
    fireEvent.click(screen.getByTestId("remove-column-btn"));
    expect(screen.getByTestId("remove-column-modal")).toBeInTheDocument();

    // Submit modal
    fireEvent.click(screen.getByTestId("submit-remove-column"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("shows and handles remove row modal", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Select a row
    const checkbox = screen.getByTestId("row-checkbox-exp1");
    fireEvent.click(checkbox);

    // Open modal
    fireEvent.click(screen.getByTestId("remove-row-btn"));
    expect(screen.getByTestId("remove-row-modal")).toBeInTheDocument();

    // Submit modal
    fireEvent.click(screen.getByTestId("submit-remove-row"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("shows and handles set column types modal", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Open modal
    fireEvent.click(screen.getByTestId("set-column-types-btn"));
    expect(screen.getByTestId("set-column-types-modal")).toBeInTheDocument();

    // Submit modal
    fireEvent.click(screen.getByTestId("submit-column-types"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("handles row selection correctly", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Select a row
    const checkbox = screen.getByTestId("row-checkbox-exp1");
    fireEvent.click(checkbox);

    // Deselect the same row
    fireEvent.click(checkbox);

    // The remove row button should be disabled
    expect(screen.getByTestId("remove-row-btn")).toHaveAttribute("disabled");
  });

  it("handles cell update correctly", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Click on a cell to update it
    fireEvent.click(screen.getByTestId("cell-0-#"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("applies function to data correctly", async () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Test Table"
          data={mockData}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Click the apply function button
    fireEvent.click(screen.getByTestId("apply-function-btn"));

    // Check if the mutation was called and refetch triggered
    await waitFor(() => {
      expect(refetchDataMock).toHaveBeenCalled();
    });
  });

  it("handles empty data array correctly", () => {
    render(
      <MockedProvider mocks={mocks} addTypename={false}>
        <Table
          tableName="Empty Table"
          data={[]}
          refetchData={refetchDataMock}
        />
      </MockedProvider>
    );

    // Component should render without crashing
    expect(screen.getByTestId("table-header")).toBeInTheDocument();
    expect(screen.getByTestId("table-body")).toBeInTheDocument();
    expect(screen.getByTestId("table-footer")).toBeInTheDocument();
  });
});
