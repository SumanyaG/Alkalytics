import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import DataFormModal from "../../../src/components/modal/DataFormModal";
import { FormDataContext } from "../../../src/pages/DataVisualize";
import { useQuery } from "@apollo/client";

// Mock Apollo Client
jest.mock("@apollo/client", () => ({
  ...jest.requireActual("@apollo/client"),
  useQuery: jest.fn(),
  gql: jest.fn(() => ({})),
}));

// Mock child components
jest.mock("../../../src/components/dropdown/SingleDropdown", () => ({
  __esModule: true,
  default: ({ onChange, options }) => (
    <select
      data-testid="mock-dropdown"
      onChange={(e) => onChange(e.target.value)}
    >
      {options?.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
}));

jest.mock("../../../src/components/dropdown/MultiSelectDropDown", () => ({
  __esModule: true,
  default: ({ onChange, dates }) => (
    <select
      data-testid="mock-multiselect"
      multiple
      onChange={(e) =>
        onChange(Array.from(e.target.selectedOptions, (option) => option.value))
      }
    >
      {dates?.map((date) => (
        <option key={date} value={date}>
          {date}
        </option>
      ))}
    </select>
  ),
}));

const mockContextValue = {
  selectedGraphType: "",
  setSelectedGraphType: jest.fn(),
  selectedDates: [],
  setSelectedDates: jest.fn(),
  selectedParamType: "",
  setSelectedParamType: jest.fn(),
  selectedParamX: "",
  setSelectedParamX: jest.fn(),
  selectedParamY: "",
  setSelectedParamY: jest.fn(),
  timeMinX: "",
  setTimeMinX: jest.fn(),
  timeMaxX: "",
  setTimeMaxX: jest.fn(),
  timeMinY: "",
  setTimeMinY: jest.fn(),
  timeMaxY: "",
  setTimeMaxY: jest.fn(),
  minX: "",
  setMinX: jest.fn(),
  maxX: "",
  setMaxX: jest.fn(),
  minY: "",
  setMinY: jest.fn(),
  maxY: "",
  setMaxY: jest.fn(),
  setGraphTitle: jest.fn(),
  setXLabel: jest.fn(),
  setYLabel: jest.fn(),
};

describe("DataFormModal", () => {
  const mockSetOpenModal = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    (useQuery as jest.Mock)
      .mockImplementationOnce(() => ({
        // For data attributes
        data: { getCollectionAttrs: ["dataAttr1", "dataAttr2"] },
        loading: false,
      }))
      .mockImplementationOnce(() => ({
        // For experiment attributes
        data: { getCollectionAttrs: ["expAttr1", "expAttr2"] },
        loading: false,
      }))
      .mockImplementationOnce(() => ({
        // For filtered data
        data: {
          getFilterCollectionData: {
            data: [{ Date: "2023-01-01" }, { Date: "2023-02-01" }],
          },
        },
        loading: false,
      }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders modal with initial step", async () => {
    render(
      <FormDataContext.Provider value={mockContextValue}>
        <DataFormModal
          setOpenModal={mockSetOpenModal}
          onSubmit={mockOnSubmit}
        />
      </FormDataContext.Provider>
    );

    expect(screen.getByText("Generate Graph")).toBeInTheDocument();
    expect(screen.getByText("Graph")).toHaveClass("Mui-active");
  });

  test("navigates through all steps correctly", async () => {
    render(
      <FormDataContext.Provider value={mockContextValue}>
        <DataFormModal
          setOpenModal={mockSetOpenModal}
          onSubmit={mockOnSubmit}
        />
      </FormDataContext.Provider>
    );

    //Select graph type
    fireEvent.change(screen.getByTestId("mock-dropdown"), {
      target: { value: "bar" },
    });
    fireEvent.click(screen.getByText("Next"));

    //Select dates
    await waitFor(() => {
      expect(screen.getByText("Data")).toHaveClass("Mui-active");
    });
    fireEvent.select(screen.getByTestId("mock-multiselect"), {
      target: { selectedOptions: [{ value: "2023-01-01" }] },
    });
    fireEvent.click(screen.getByText("Next"));

    // Select parameters
    await waitFor(() => {
      expect(screen.getByText("Parameters")).toHaveClass("Mui-active");
    });
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[0], {
      target: { value: "data" },
    });
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[1], {
      target: { value: "dataAttr1" },
    });
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[2], {
      target: { value: "dataAttr2" },
    });
    fireEvent.click(screen.getByText("Next"));

    // Customize
    await waitFor(() => {
      expect(screen.getByText("Customize")).toHaveClass("Mui-active");
    });
    fireEvent.click(screen.getByText("Submit"));
  });

  test("validates required fields at each step", async () => {
    render(
      <FormDataContext.Provider value={mockContextValue}>
        <DataFormModal
          setOpenModal={mockSetOpenModal}
          onSubmit={mockOnSubmit}
        />
      </FormDataContext.Provider>
    );

    // Next should be disabled initially
    expect(screen.getByText("Next")).toBeDisabled();

    fireEvent.change(screen.getByTestId("mock-dropdown"), {
      target: { value: "bar" },
    });
    fireEvent.click(screen.getByText("Next"));

    // Next should be disabled until dates selected
    await waitFor(() => {
      expect(screen.getByText("Next")).toBeDisabled();
    });
  });

  test("shows error for invalid parameter selection", async () => {
    const experimentContext = {
      ...mockContextValue,
      selectedParamType: "experiments",
      selectedDates: ["2023-01-01"],
    };

    render(
      <FormDataContext.Provider value={experimentContext}>
        <DataFormModal
          setOpenModal={mockSetOpenModal}
          onSubmit={mockOnSubmit}
        />
      </FormDataContext.Provider>
    );

    // Navigate to parameters step
    fireEvent.change(screen.getByTestId("mock-dropdown"), {
      target: { value: "bar" },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.select(screen.getByTestId("mock-multiselect"), {
      target: { selectedOptions: [{ value: "2023-01-01" }] },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[0], {
      target: { value: "experiments" },
    });

    await waitFor(() => {
      expect(
        screen.getByText("More than 1 experiment date must be selected")
      ).toBeInTheDocument();
    });
  });

  test("validates axis ranges and shows errors", async () => {
    render(
      <FormDataContext.Provider value={mockContextValue}>
        <DataFormModal
          setOpenModal={mockSetOpenModal}
          onSubmit={mockOnSubmit}
        />
      </FormDataContext.Provider>
    );

    // Navigate to customize step
    fireEvent.change(screen.getByTestId("mock-dropdown"), {
      target: { value: "bar" },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.select(screen.getByTestId("mock-multiselect"), {
      target: { selectedOptions: [{ value: "2023-01-01" }] },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[0], {
      target: { value: "data" },
    });
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[1], {
      target: { value: "dataAttr1" },
    });
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[2], {
      target: { value: "dataAttr2" },
    });
    fireEvent.click(screen.getByText("Next"));

    // Test invalid numeric range
    const minInput = screen.getAllByLabelText("Min")[0];
    const maxInput = screen.getAllByLabelText("Max")[0];

    fireEvent.change(minInput, { target: { value: "100" } });
    fireEvent.change(maxInput, { target: { value: "50" } });

    fireEvent.click(screen.getByText("Submit"));
    expect(
      screen.getByText(/Min value cannot be greater than max value/i)
    ).toBeInTheDocument();
  });

  test("handles form submission successfully", async () => {
    render(
      <FormDataContext.Provider value={mockContextValue}>
        <DataFormModal
          setOpenModal={mockSetOpenModal}
          onSubmit={mockOnSubmit}
        />
      </FormDataContext.Provider>
    );

    // Complete all steps
    fireEvent.change(screen.getByTestId("mock-dropdown"), {
      target: { value: "bar" },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.select(screen.getByTestId("mock-multiselect"), {
      target: { selectedOptions: [{ value: "2023-01-01" }] },
    });
    fireEvent.click(screen.getByText("Next"));
    fireEvent.change(screen.getAllByTestId("mock-dropdown")[0], {
      target: { value: "data" },
    });
    fireEvent.click(screen.getByText("Next"));

    // Fill valid axis ranges
    const minInput = screen.getAllByLabelText("Min")[0];
    const maxInput = screen.getAllByLabelText("Max")[0];
    fireEvent.change(minInput, { target: { value: "10" } });
    fireEvent.change(maxInput, { target: { value: "100" } });

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => {
      expect(mockSetOpenModal).toHaveBeenCalledWith(false);
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });
});
