import React, { useState } from "react";

type TableFooterProps = {
  columns: string[];
  data: any[];
  onAddColumn: () => void;
  onAddRow: () => void;
  onRemoveColumn: () => void;
  onRemoveRow: () => void;
  selectedRows: Set<string>;
  graphType?: string;
};

const TableFooter: React.FC<TableFooterProps> = ({
  data,
  onAddColumn,
  onAddRow,
  onRemoveColumn,
  onRemoveRow,
  graphType,
}) => {
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);

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

  return (
    <div className="flex justify-between items-center px-4 py-2 bg-white border-t border-gray-300">
      <div className="relative">
        {graphType === "experiment" && (
          <button
            onClick={toggleEditDropdown}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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

      <div className="flex items-center space-x-4">
        <span className="text-sm text-gray-600">
          Total Rows: <strong>{data.length}</strong>
        </span>
      </div>
    </div>
  );
};

export default TableFooter;
