import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TableHeader from "../../../src/components/table/TableHeader";
import { useAuth } from "../../../src/context/authContext";

jest.mock("../../../src/context/authContext", () => ({
  useAuth: jest.fn(),
}));

describe("TableHeader Component", () => {
  const defaultProps = {
    columns: ["column1", "column2", "column3"],
    tableName: "Test Table",
    selectedColumn: "",
    setSelectedColumn: jest.fn(),
    searchKeyword: "",
    setSearchKeyword: jest.fn(),
    onSetColumnTypes: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({ userRole: { role: "user" } });
  });

  test("renders table name correctly", () => {
    render(<TableHeader {...defaultProps} />);
    expect(screen.getByText("Test Table")).toBeInTheDocument();
  });

  test("renders column select with all options", () => {
    render(<TableHeader {...defaultProps} />);

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();

    expect(screen.getByText("All Columns")).toBeInTheDocument();

    expect(screen.getByText("COLUMN1")).toBeInTheDocument();
    expect(screen.getByText("COLUMN2")).toBeInTheDocument();
    expect(screen.getByText("COLUMN3")).toBeInTheDocument();
  });

  test("renders search input with correct placeholder", () => {
    render(<TableHeader {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search...");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("");
  });

  test("triggers setSelectedColumn when column select changes", () => {
    render(<TableHeader {...defaultProps} />);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "column1" } });

    expect(defaultProps.setSelectedColumn).toHaveBeenCalledWith("column1");
  });

  test("triggers setSearchKeyword when search input changes", () => {
    render(<TableHeader {...defaultProps} />);

    const searchInput = screen.getByPlaceholderText("Search...");
    fireEvent.change(searchInput, { target: { value: "test search" } });

    expect(defaultProps.setSearchKeyword).toHaveBeenCalledWith("test search");
  });

  test("does not render Set Column Types button for non-admin users", () => {
    render(<TableHeader {...defaultProps} graphType="experiment" />);

    const button = screen.queryByText("Set Column Types");
    expect(button).not.toBeInTheDocument();
  });

  test("renders Set Column Types button for admin users with experiment graphType", () => {
    (useAuth as jest.Mock).mockReturnValue({ userRole: { role: "admin" } });

    render(<TableHeader {...defaultProps} graphType="experiment" />);

    const button = screen.getByText("Set Column Types");
    expect(button).toBeInTheDocument();
  });

  test("calls onSetColumnTypes when Set Column Types button is clicked", () => {
    (useAuth as jest.Mock).mockReturnValue({ userRole: { role: "admin" } });

    render(<TableHeader {...defaultProps} graphType="experiment" />);

    const button = screen.getByText("Set Column Types");
    fireEvent.click(button);

    expect(defaultProps.onSetColumnTypes).toHaveBeenCalledTimes(1);
  });

  test("doesn't show Set Column Types button when graphType is not experiment", () => {
    (useAuth as jest.Mock).mockReturnValue({ userRole: { role: "admin" } });

    render(<TableHeader {...defaultProps} graphType="other" />);

    const button = screen.queryByText("Set Column Types");
    expect(button).not.toBeInTheDocument();
  });

  test("formats column names by replacing underscores with spaces and uppercasing", () => {
    const propsWithUnderscores = {
      ...defaultProps,
      columns: ["user_name", "created_at", "last_login"],
    };

    render(<TableHeader {...propsWithUnderscores} />);

    expect(screen.getByText("USER NAME")).toBeInTheDocument();
    expect(screen.getByText("CREATED AT")).toBeInTheDocument();
    expect(screen.getByText("LAST LOGIN")).toBeInTheDocument();
  });
});
