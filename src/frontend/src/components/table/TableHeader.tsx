import React, { useState } from "react";

type TableHeaderProps = {
  columns: string[];
  tableName: string;
  selectedColumn: string;
  setSelectedColumn: React.Dispatch<React.SetStateAction<string>>;
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  tableName,
  selectedColumn,
  setSelectedColumn,
  searchKeyword,
  setSearchKeyword,
}) => {
  const [isEditDropdownOpen, setIsEditDropdownOpen] = useState(false);

  const toggleEditDropdown = () => {
    setIsEditDropdownOpen(!isEditDropdownOpen);
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
              <select
                className="w-52 h-12 p-2 rounded my-2 border border-gray-300"
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
                className="w-52 h-12 p-2 rounded my-2 border border-gray-300"
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
