import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
// @ts-ignore
import * as formulajs from "formulajs";
import TableFooter from "../../../src/components/table/TableFooter";
import { useAuth } from "../../../src/context/authContext";

jest.mock("../../../src/context/authContext");
jest.mock("formulajs");

const mockUseAuth = useAuth as jest.Mock;

const defaultProps = {
  columns: ["A", "B", "C"],
  data: [
    { experimentId: "1", A: 10, B: 20, C: 30 },
    { experimentId: "2", A: 40, B: 50, C: 60 },
  ],
  onAddColumn: jest.fn(),
  onAddRow: jest.fn(),
  onRemoveColumn: jest.fn(),
  onRemoveRow: jest.fn(),
  selectedRows: new Set(["1"]),
  graphType: "experiment",
  onApplyFunction: jest.fn(),
};

const renderComponent = (props = defaultProps) => {
  return render(<TableFooter {...props} />);
};

describe("TableFooter", () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ userRole: { role: "user" } });
    (formulajs.SUM as jest.Mock).mockReturnValue(30);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("renders correctly", () => {
    const { getByText, getByPlaceholderText } = renderComponent();
    expect(getByPlaceholderText("Fx (e.g., SUM(A, B))")).toBeInTheDocument();
    expect(getByText("Apply", { exact: false })).toBeInTheDocument();
  });

  it("toggles edit dropdown on Edit button click", () => {
    const { getByText, queryByText } = renderComponent();
    const editButton = getByText("Edit", { exact: false });

    fireEvent.click(editButton);
    expect(queryByText("Add Column", { exact: false })).toBeInTheDocument();

    fireEvent.click(editButton);
    expect(queryByText("Add Column", { exact: false })).not.toBeInTheDocument();
  });

  it("calls onAddColumn when Add Column is clicked", () => {
    const { getByText } = renderComponent();
    fireEvent.click(getByText("Edit", { exact: false }));
    fireEvent.click(getByText("Add Column", { exact: false }));
    expect(defaultProps.onAddColumn).toHaveBeenCalled();
  });

  it("applies function correctly with valid input", async () => {
    const { getByPlaceholderText, getByText } = renderComponent();

    fireEvent.change(getByPlaceholderText("Fx (e.g., SUM(A, B))"), {
      target: { value: "SUM(A)" },
    });

    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "C" },
    });

    fireEvent.click(getByText("Apply", { exact: false }));

    await waitFor(() => {
      expect(defaultProps.onApplyFunction).toHaveBeenCalledWith({
        "1": { C: 30 },
      });
      expect(getByText("Apply", { exact: false })).toHaveClass("bg-green-600");
    });
  });

  it("opens and closes help modal", () => {
    const { getByText, queryByText } = renderComponent();
    fireEvent.click(getByText("?", { exact: false }));
    expect(
      getByText("Function Bar Guide", { exact: false })
    ).toBeInTheDocument();
    fireEvent.click(getByText("Close", { exact: false }));
    expect(
      queryByText("Function Bar Guide", { exact: false })
    ).not.toBeInTheDocument();
  });
});
