import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TableBody from "../../../src/components/table/TableBody";
import { DataRow } from "../../../src/components/table/Table";

// Mock data
const mockData: DataRow[] = [
  {
    _id: "1",
    experimentId: "exp1",
    parameter: "value1",
    numericField: 10,
    date: "2023-01-01",
  },
  {
    _id: "2",
    experimentId: "exp2",
    parameter: "value2",
    numericField: 5,
    date: "2023-02-01",
  },
];

const mockColumns = [
  "_id",
  "experimentId",
  "parameter",
  "numericField",
  "date",
];

const mockProps = {
  data: mockData,
  columns: mockColumns,
  selectedRows: new Set<string>(),
  setSelectedRows: jest.fn(),
  onUpdateCell: jest.fn().mockResolvedValue({}),
};

describe("TableBody Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders basic table structure", () => {
    render(<TableBody {...mockProps} />);

    // Verify column headers using more specific queries
    expect(
      screen.getByRole("columnheader", { name: /A: ID/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("columnheader", { name: /B: EXPERIMENTID/i })
    ).toBeInTheDocument();

    // Verify data rows
    expect(screen.getByText("exp1")).toBeInTheDocument();
    expect(screen.getByText("value1")).toBeInTheDocument();
  });

  test("handles cell editing", async () => {
    render(<TableBody {...mockProps} graphType="experiment" />);

    const cell = screen.getByText("value1");
    userEvent.dblClick(cell);

    const input = screen.getByDisplayValue("value1");
    userEvent.type(input, "updated{enter}");

    await waitFor(() => {
      expect(mockProps.onUpdateCell).toHaveBeenCalledWith({
        exp1: { parameter: "value1updated" },
      });
    });
  });

  test("handles row selection", () => {
    render(<TableBody {...mockProps} graphType="experiment" />);

    const checkbox = screen.getAllByRole("checkbox")[0];
    userEvent.click(checkbox);

    expect(mockProps.setSelectedRows).toHaveBeenCalledWith(mockData[0]);
  });

  test("highlights keywords", () => {
    render(<TableBody {...mockProps} highlightKeyword="value1" />);

    const highlighted = screen.getByText("value1");
    expect(highlighted).toHaveClass("bg-yellow-200");
  });

  test("shows upload status indicators", async () => {
    render(<TableBody {...mockProps} graphType="experiment" />);

    const cell = screen.getByText("value1");
    userEvent.dblClick(cell);

    const input = screen.getByDisplayValue("value1");
    userEvent.type(input, "{enter}");

    // Verify uploading status
    await waitFor(() => {
      expect(cell.closest("td")).toHaveClass("border-yellow-500");
    });

    // Verify success status
    await waitFor(() => {
      expect(cell.closest("td")).toHaveClass("border-green-500");
    });
  });

  test("prevents editing non-editable columns", () => {
    render(<TableBody {...mockProps} graphType="experiment" />);

    const idCell = screen.getByText("1");
    userEvent.dblClick(idCell);

    expect(screen.queryByDisplayValue("1")).not.toBeInTheDocument();
  });
});
