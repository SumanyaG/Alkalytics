// -----------------------------------------------------------------------------
// Primary Author: Jason T
// Year: 2025
// Component: TableFooter
// Purpose: Table footer component, providing button functionalities for
// adding/removing rows/columns, applying functions, and computing efficiencies.
// -----------------------------------------------------------------------------

import type React from "react";
import { useMemo, useState } from "react";
// @ts-ignore
import * as formulajs from "formulajs";
import type { DataRow } from "./Table";
import { useAuth } from "../../context/authContext";
import { Add, Remove, Functions, Help, Settings } from "@mui/icons-material";

type TableFooterProps = {
  columns: string[];
  data: DataRow[];
  onAddColumn: () => void;
  onAddRow: () => void;
  onRemoveColumn: () => void;
  onRemoveRow: () => void;
  onSetColumnTypes: () => void;
  selectedRows: Set<string>;
  graphType?: string;
  onApplyFunction: (updatedData: Record<string, unknown>) => Promise<void>;
  onComputeEfficiency: () => void;
};

const TableFooter: React.FC<TableFooterProps> = ({
  columns,
  data,
  onAddColumn,
  onAddRow,
  onRemoveColumn,
  onRemoveRow,
  onSetColumnTypes,
  selectedRows,
  graphType,
  onApplyFunction,
  onComputeEfficiency,
}) => {
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);
  const [fxValues, setFxValues] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const dataMap = useMemo(() => {
    return data.reduce((acc, item, idx) => {
      if (item.experimentId) {
        acc[item.experimentId] = { ...item, idx };
      }
      return acc;
    }, {} as Record<string, DataRow>);
  }, [data]);

  const { userRole } = useAuth();

  const toggleEditDropdown = () => {
    setIsEditDropdownOpen(!isEditDropdownOpen);
  };

  const closeDropdown = () => {
    setIsEditDropdownOpen(false);
  };

  const handleAddColumn = () => {
    onAddColumn();
    closeDropdown();
  };

  const handleAddRow = () => {
    onAddRow();
    closeDropdown();
  };

  const handleRemoveColumn = () => {
    onRemoveColumn();
    closeDropdown();
  };

  const handleRemoveRow = () => {
    onRemoveRow();
    closeDropdown();
  };

  const handleComputeEff = () => {
    onComputeEfficiency();
  }

  const handleFxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFxValues(e.target.value);
    setError(null);
  };

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value);
  };

  const handleSetColumnTypeChange = () => {
    onSetColumnTypes();
    closeDropdown();
  };

  const excelColumnToIndex = (column: string): number => {
    let index = 0;
    for (let i = 0; i < column.length; i++) {
      index = index * 26 + (column.charCodeAt(i) - 64);
    }
    return index - 1;
  };

  const extractColumnReferences = (formula: string): string[] => {
    const regex = /\b[A-Z]+\b/g;
    const matches = formula.match(regex) || [];

    return matches.filter((match) => !(match in formulajs));
  };

  const applyFunction = async () => {
    if (!fxValues || !selectedColumn) {
      setError("Please enter a valid function and select a target column.");
      return;
    }

    const functionName = fxValues.split("(")[0];
    if (!(functionName in formulajs)) {
      setError("Invalid function. Please enter a valid Formula.js function.");
      return;
    }

    const columnReferences = extractColumnReferences(fxValues);
    if (columnReferences.length === 0) {
      setError("No valid column references found in the formula.");
      return;
    }

    const columnIndices = columnReferences.map((col) =>
      excelColumnToIndex(col)
    );
    if (columnIndices.some((index) => index < 0 || index >= columns.length)) {
      setError("Invalid column reference. Column does not exist.");
      return;
    }

    setLoading(true);
    setSuccess(false);
    setError(null);

    try {
      const updatedDataMap = { ...dataMap };
      const updatedRows: Record<string, DataRow> = {};

      Array.from(selectedRows).forEach((id) => {
        if (!updatedDataMap[id]) return;

        const values = columnIndices.map(
          (index) => updatedDataMap[id][columns[index]]
        );
        const computedValue = formulajs[functionName](...values);

        updatedDataMap[id] = {
          ...updatedDataMap[id],
          [selectedColumn]: computedValue,
        };

        updatedRows[id] = {
          [selectedColumn]: computedValue,
        };
      });

      await onApplyFunction(updatedRows);

      setSuccess(true);
    } catch (e) {
      setError("An error occurred while applying the function.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-10 border-t border-blue-100/50 bg-white/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex h-full w-full flex-row justify-between items-center">
        <div className="relative">
          {graphType === "experiment" && userRole.role !== "assistant" && (
            <div className="flex relative">
              <button
                onClick={toggleEditDropdown}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <span className="relative z-10 flex items-center">
                  <span>Edit</span>
                </span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
              </button>

              {isEditDropdownOpen && (
                <div className="absolute bottom-full mb-2 left-0 w-48 overflow-hidden rounded-lg border border-blue-100 bg-white/95 shadow-lg backdrop-blur-sm">
                  <button
                    onClick={handleAddColumn}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <Add className="mr-2 h-4 w-4" />
                    Add Column
                  </button>
                  <button
                    onClick={handleAddRow}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <Add className="mr-2 h-4 w-4" />
                    Add Row
                  </button>
                  <button
                    onClick={handleRemoveColumn}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <Remove className="mr-2 h-4 w-4" />
                    Remove Column
                  </button>
                  <button
                    onClick={handleRemoveRow}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <Remove className="mr-2 h-4 w-4" />
                    Remove Row
                  </button>

                  <button
                    onClick={handleSetColumnTypeChange}
                    className="flex w-full items-center px-4 py-2 text-left text-sm text-blue-700 transition-colors hover:bg-blue-50"
                  >
                    <Settings className="mr-2 h-1 w-1" />
                    Set Column Types
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {graphType === "experiment" && userRole.role !== "assistant" && (
          <div className="flex flex-1 items-center mx-4 space-x-2">
            <div className="relative">
              <select
                value={selectedColumn}
                onChange={handleColumnChange}
                className="h-10 appearance-none rounded-lg border border-blue-100 bg-white/80 pl-3 pr-10 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              >
                <option value="">Select Target Column</option>
                {columns.map((col, index) => (
                  <option key={index} value={col}>
                    {col}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-blue-400">
                <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>

            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
                <Functions className="h-4 w-4" />
              </div>
              <input
                type="text"
                className={`h-10 w-full rounded-lg border pl-10 pr-4 text-sm text-blue-900 shadow-sm transition-all focus:outline-none focus:ring-2 ${
                  error
                    ? "border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-200"
                    : loading
                    ? "border-yellow-300 bg-yellow-50/30 focus:border-yellow-400 focus:ring-yellow-200"
                    : success
                    ? "border-green-300 bg-green-50/30 focus:border-green-400 focus:ring-green-200"
                    : "border-blue-100 bg-white/80 focus:border-blue-300 focus:ring-blue-200"
                }`}
                placeholder="Fx (e.g., SUM(A, B))"
                value={fxValues}
                onChange={handleFxChange}
              />
            </div>

            <button
              onClick={applyFunction}
              disabled={
                loading || !!error || !selectedColumn || selectedRows.size === 0
              }
              className={`group relative h-10 overflow-hidden rounded-lg px-4 text-sm font-bold shadow-md transition-all duration-200 ${
                loading
                  ? "bg-yellow-500 text-white"
                  : fxValues &&
                    selectedColumn &&
                    !error &&
                    selectedRows.size !== 0
                  ? "bg-gradient-to-r from-green-500 to-green-600 text-white hover:shadow-lg"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <span className="relative z-10">Apply</span>
              {!(
                loading ||
                !!error ||
                !selectedColumn ||
                selectedRows.size === 0
              ) && (
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-green-400 to-green-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
              )}
            </button>

            <button
              onClick={() => setIsModalOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 transition-colors hover:bg-blue-200"
            >
              <Help className="h-5 w-5" />
            </button>
          </div>
        )}

        {graphType === "experiment" && (
          <div className="flex items-center">
            <button
              onClick={handleComputeEff}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center">Compute &eta;</span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
            </button>
          </div>
        )}

        <div className="flex items-center">
          <div className="rounded-lg bg-blue-50/50 px-3 py-1.5 text-sm text-blue-700">
            Total Rows: <span className="font-bold">{data.length}</span>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 rounded-lg -mt-[100vh] flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-white/20 bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm">
            <h2 className="mb-2 text-lg font-bold text-blue-900">
              Function Bar Guide
            </h2>
            <p className="text-sm text-blue-700">
              Enter a formula using column references (e.g., `SUM(A, B)`) to
              apply calculations to the selected column. Ensure the formula is
              valid.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <span className="relative z-10">Close</span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFooter;
