import React, { useState, useMemo, useEffect } from "react";
import "tailwindcss/tailwind.css";
import TableBody from "./TableBody";
import TableFooter from "./TableFooter";

export type DataRow = Record<string, string | number | undefined | null>;

type TableProps = {
  tableName: string;
  data: DataRow[];
  isOpen?: boolean;
};

const Table: React.FC<TableProps> = ({ tableName, data }) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<string>("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  const columns = useMemo(
    () => [...(data.length > 0 ? Object.keys(data[0]) : [])],
    [data]
  );

  const filteredData = useMemo(() => {
    if (!debouncedKeyword) return data;
    const lowercasedKeyword = debouncedKeyword.toLowerCase();
    return data.filter((row) =>
      selectedColumn
        ? String(row[selectedColumn] || "")
            .toLowerCase()
            .includes(lowercasedKeyword)
        : columns.some((column) =>
            String(row[column] || "")
              .toLowerCase()
              .includes(lowercasedKeyword)
          )
    );
  }, [debouncedKeyword, data, columns, selectedColumn]);

  return (
    <div className="h-screen flex flex-col items-center min-h-screen w-full p-8 text-blue-900">
      <div className="w-full shadow-lg rounded-lg flex flex-col overflow-hidden border-gray-300 bg-white h-full">
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
        <div style={{ flex: 1, overflow: "hidden" }}>
          <TableBody
            columns={columns}
            data={filteredData}
            highlightKeyword={debouncedKeyword}
          />
        </div>
        <TableFooter columns={columns} data={filteredData} />
      </div>
    </div>
  );
};

export default Table;
