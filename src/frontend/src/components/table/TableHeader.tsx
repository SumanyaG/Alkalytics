import type React from "react";
import { Search } from "@mui/icons-material";

type TableHeaderProps = {
  columns: string[];
  tableName: string;
  selectedColumn: string;
  setSelectedColumn: React.Dispatch<React.SetStateAction<string>>;
  searchKeyword: string;
  setSearchKeyword: React.Dispatch<React.SetStateAction<string>>;
  graphType?: string;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  tableName,
  selectedColumn,
  setSelectedColumn,
  searchKeyword,
  setSearchKeyword,
  graphType,
}) => {

  return (
    <div className="border-b border-blue-100/50">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <div className="relative">
            <h1 className="pl-3 text-2xl font-bold text-blue-900">
              {tableName}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <select
              className="h-10 w-52 appearance-none rounded-lg border border-blue-100 bg-white/80 pl-3 pr-10 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
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

          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="h-10 w-52 rounded-lg border border-blue-100 bg-white/80 pl-10 pr-4 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-blue-400">
              <Search className="h-4 w-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TableHeader;
