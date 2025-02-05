import React, { useMemo, useState } from "react";
// @ts-ignore
import * as formulajs from "formulajs";
import { DataRow } from "./Table";

type TableFooterProps = {
  columns: string[];
  data: DataRow[];
  onAddColumn: () => void;
  onAddRow: () => void;
  onRemoveColumn: () => void;
  onRemoveRow: () => void;
  selectedRows: Set<string>;
  graphType?: string;
  onApplyFunction: (updatedData: Record<string, unknown>) => Promise<void>;
};

const TableFooter: React.FC<TableFooterProps> = ({
  columns,
  data,
  onAddColumn,
  onAddRow,
  onRemoveColumn,
  onRemoveRow,
  selectedRows,
  graphType,
  onApplyFunction,
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

  const handleFxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFxValues(e.target.value);
    setError(null);
  };

  const handleColumnChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedColumn(e.target.value);
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
    <div className="flex justify-between items-center px-4 py-2 bg-white border-t border-gray-300">
      <div className="h-full w-full flex flex-row justify-between ">
        <div className="relative">
          {graphType === "experiment" && (
            <button
              onClick={toggleEditDropdown}
              className="h-full px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit
            </button>
          )}

          {isEditDropdownOpen && (
            <div className="absolute bottom-full mb-2 left-0 w-40 bg-white shadow-lg rounded-lg border border-gray-300">
              <button
                onClick={handleAddColumn}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-100 rounded-t-lg"
              >
                Add Column
              </button>
              <button
                onClick={handleAddRow}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-green-100"
              >
                Add Row
              </button>
              <button
                onClick={handleRemoveColumn}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-100"
              >
                Remove Column
              </button>
              <button
                onClick={handleRemoveRow}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-red-100 rounded-b-lg"
              >
                Remove Row
              </button>
            </div>
          )}
        </div>

        {graphType === "experiment" && (
          <div className="flex-1 flex items-center mx-4">
            <select
              value={selectedColumn}
              onChange={handleColumnChange}
              className="h-full border border-gray-300 rounded-lg px-2 py-2"
            >
              <option value="">Select Target Column</option>
              {columns.map((col, index) => (
                <option key={index} value={col}>
                  {col}
                </option>
              ))}
            </select>
            <input
              type="text"
              className={`h-full flex-[10] border rounded-lg px-2 py-2 ml-2 ${
                error
                  ? "border-red-500 border-2"
                  : loading
                  ? "border-yellow-500 border-2"
                  : success
                  ? "border-green-500 border-2"
                  : "border-gray-300"
              }`}
              placeholder="Fx (e.g., SUM(A, B))"
              value={fxValues}
              onChange={handleFxChange}
            />
            <button
              onClick={applyFunction}
              disabled={
                loading || !!error || !selectedColumn || selectedRows.size === 0
              }
              className={`h-full px-4 py-2 ml-2 rounded-lg ${
                loading
                  ? "bg-yellow-500 text-white cursor-not-allowed"
                  : fxValues &&
                    selectedColumn &&
                    !error &&
                    selectedRows.size !== 0
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Apply
            </button>
            {/* Question Mark Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-2 w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center hover:bg-gray-300"
            >
              ?
            </button>
          </div>
        )}

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            Total Rows: <strong>{data.length}</strong>
          </span>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 border border-gray-300">
            <h2 className="text-lg font-semibold text-blue-900">
              Function Bar Guide
            </h2>
            <p className="text-sm text-gray-700 mt-2">
              Enter a formula using column references (e.g., `SUM(A, B)`) to
              apply calculations to the selected column. Ensure the formula is
              valid.
            </p>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableFooter;
