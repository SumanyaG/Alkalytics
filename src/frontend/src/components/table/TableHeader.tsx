import React from "react";
import { useAuth } from "../../context/authContext";

type TableHeaderProps = {
  columns: string[];
  tableName: string;
  selectedColumn: string;
  setSelectedColumn: React.Dispatch<React.SetStateAction<string>>;
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
  onSetColumnTypes: () => void;
  graphType?: string;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  tableName,
  selectedColumn,
  setSelectedColumn,
  searchKeyword,
  setSearchKeyword,
  onSetColumnTypes,
  graphType,
}) => {
  const { userRole } = useAuth();

  const handleSetColumnTypeChange = () => {
    onSetColumnTypes();
  };

  return (
    <thead>
      <tr className="flex">
        <th colSpan={columns.length + 1} className="px-4 py-2 w-full">
          <div className="flex justify-between items-center">
            <span className="text-2xl font-semibold text-blue-900">
              {tableName}
            </span>
            <div className="flex items-center space-x-2">
              {graphType === "experiment" && userRole.role === "admin" && (
                <button
                  onClick={handleSetColumnTypeChange}
                  className="h-full px-4 py-2 rounded-lg text-white text-left text-sm bg-blue-600 hover:bg-blue-700"
                >
                  Set Column Types
                </button>
              )}
              <select
                className="w-52 h-12 p-2 rounded-lg my-2 border border-gray-300"
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
              >
                <option value="">All Columns</option>
                {columns.map((column) => (
                  <option key={column} value={column}>
                    {column.replace(/_/g, " ").toUpperCase()}
                  </option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search..."
                className="w-52 h-12 p-2 rounded-lg my-2 border border-gray-300"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
              />
            </div>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default TableHeader;
