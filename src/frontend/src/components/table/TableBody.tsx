import React from "react";
import { DataRow } from "./Table";

type TableProps = {
  data: DataRow[];
  columns: string[];
  highlightKeyword?: string;
};

const TableBody: React.FC<TableProps> = ({
  data,
  columns,
  highlightKeyword,
}) => {
  const flattenData = (
    value: number | string | string[] | Record<string, DataRow>
  ): string => {
    if (typeof value === "object") {
      if (Array.isArray(value)) {
        return value.join(", ");
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const formatColumnHeader = (column: string): string =>
    column.replace(/_/g, " ").toUpperCase().trim();

  const getHighlightedText = (text: string): React.ReactNode => {
    if (!highlightKeyword) return text;
    const parts = text.split(new RegExp(`(${highlightKeyword})`, "gi"));
    return parts.map((part, index) =>
      part.toLowerCase() === highlightKeyword.toLowerCase() ? (
        <span key={index} className="bg-yellow-200">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div
      className="h-full box-border px-4 overflow-auto overflow-scroll"
      style={{
        minHeight: "100%",
        maxHeight: `100%`,
        maxWidth: `calc(100% - 1rem)`,
      }}
    >
      <table className="min-w-full border-collapse bg-white ">
        <thead className="sticky top-0 z-10 bg-white ">
          <tr>
            {columns.map((column) => (
              <th
                key={column}
                className="px-4 py-2 text-left text-sm font-semibold text-blue-900"
              >
                {formatColumnHeader(column)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {data.map((row, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;
            return (
              <tr
                key={rowIndex}
                className={`${isEvenRow ? "" : "bg-slate-50"}`}
              >
                {columns.map((column) => (
                  <td
                    key={column}
                    className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap"
                  >
                    {getHighlightedText(flattenData(row[column] || ""))}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableBody;
