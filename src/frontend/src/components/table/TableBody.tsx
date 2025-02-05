import React, { useState, useRef, useEffect } from "react";
import { ArrowUpward, ArrowDownward, UnfoldMore } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { DataRow } from "./Table";

type TableProps = {
  data: DataRow[];
  columns: string[];
  highlightKeyword?: string;
  graphType?: string;
  selectedRows: Set<string>;
  setSelectedRows: (row: DataRow) => void;
  onUpdateCell: (updatedData: Record<string, DataRow>) => Promise<void>;
};

const TableBody: React.FC<TableProps> = ({
  data,
  columns,
  highlightKeyword,
  graphType,
  selectedRows,
  setSelectedRows,
  onUpdateCell,
}) => {
  const [editingCell, setEditingCell] = useState<{
    rowIndex: number;
    column: string;
  } | null>(null);
  const [editValue, setEditValue] = useState("");
  const [uploadStatus, setUploadStatus] = useState<{
    [key: string]: "idle" | "uploading" | "success";
  }>({});
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [sortConfig, setSortConfig] = useState<{
    column: string | null;
    direction: "asc" | "desc" | "none";
  }>({ column: null, direction: "none" });

  const handleSort = (column: string) => {
    if (column === "_id" || column === "experimentId") return;

    let direction: "asc" | "desc" | "none" = "asc";
    if (sortConfig.column === column) {
      if (sortConfig.direction === "asc") {
        direction = "desc";
      } else if (sortConfig.direction === "desc") {
        direction = "none";
      }
    }
    setSortConfig({ column, direction });
  };

  const sortedData = React.useMemo(() => {
    if (sortConfig.direction === "none" || !sortConfig.column) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column!]?.toString() ?? "";
      const bValue = b[sortConfig.column!]?.toString() ?? "";

      const isNumeric =
        !isNaN(parseFloat(aValue)) && isFinite(parseFloat(aValue));

      if (isNumeric) {
        return sortConfig.direction === "asc"
          ? parseFloat(aValue) - parseFloat(bValue)
          : parseFloat(bValue) - parseFloat(aValue);
      } else {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
    });
  }, [data, sortConfig]);

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

  const handleInputChange = (value: string) => {
    setEditValue(value);
  };

  const handleKeyPress = async (
    e: React.KeyboardEvent,
    rowIndex: number,
    column: string
  ) => {
    if (e.key === "Enter") {
      const originalValue = data[rowIndex][column];
      const updatedValue = editValue;

      setEditingCell(null);
      setUploadStatus((prev) => ({
        ...prev,
        [`${rowIndex}-${column}`]: "uploading",
      }));

      try {
        const expId = data[rowIndex].experimentId as string;
        const updatedParams = { [column]: updatedValue };
        await onUpdateCell({ [expId]: updatedParams });

        setUploadStatus((prev) => ({
          ...prev,
          [`${rowIndex}-${column}`]: "success",
        }));

        setTimeout(() => {
          setUploadStatus((prev) => ({
            ...prev,
            [`${rowIndex}-${column}`]: "idle",
          }));
        }, 2000);
      } catch (error) {
        setEditValue((originalValue as string) ?? "");
        setUploadStatus((prev) => ({
          ...prev,
          [`${rowIndex}-${column}`]: "idle",
        }));
      }
    } else if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleClickOutside = (e: MouseEvent) => {
    if (inputRef.current && !inputRef.current.contains(e.target as Node)) {
      setEditingCell(null);
    }
  };

  useEffect(() => {
    if (editingCell) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [editingCell]);

  const isEditableColumn = (column: string): boolean => {
    const lowerColumn = column.toLowerCase();

    const isNonEditable =
      lowerColumn.includes("id") ||
      lowerColumn === "#" ||
      lowerColumn === "time" ||
      lowerColumn === "date";

    return graphType === "experiment" && !isNonEditable;
  };

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

  const getCellStyle = (rowIndex: number, column: string): string => {
    const status = uploadStatus[`${rowIndex}-${column}`];
    switch (status) {
      case "uploading":
        return "border-2 border-yellow-500 rounded px-2 py-1";
      case "success":
        return "border-2 border-green-500 rounded px-2 py-1";
      default:
        return "";
    }
  };
  const formattedColumns = columns.map(
    (col, index) => `${String.fromCharCode(65 + index)}: ${col}`
  );

  return (
    <div
      className="h-full box-border px-4 overflow-auto overflow-scroll"
      style={{
        minHeight: "100%",
        maxHeight: "100%",
        maxWidth: "calc(100% - 2rem)",
        marginLeft: "1rem",
      }}
    >
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-2 bg-white">
          <tr>
            {graphType === "experiment" && (
              <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600"></th>
            )}
            {formattedColumns.map((formattedColumn, index) => {
              const [label, column] = formattedColumn.split(": ");
              return (
                <th
                  key={column}
                  className="px-4 py-2 text-left font-semibold text-gray-600"
                >
                  <div className="flex items-center">
                    <span className="text-gray-400 text-xs mr-2">{label}:</span>
                    <span className="text-blue-900">
                      {formatColumnHeader(column)}
                    </span>
                    {column !== "_id" && column !== "experimentId" && (
                      <IconButton
                        size="small"
                        onClick={() => handleSort(column)}
                        className="ml-2"
                      >
                        {sortConfig.column === column ? (
                          sortConfig.direction === "asc" ? (
                            <ArrowUpward fontSize="small" />
                          ) : sortConfig.direction === "desc" ? (
                            <ArrowDownward fontSize="small" />
                          ) : (
                            <UnfoldMore
                              fontSize="small"
                              style={{ opacity: 0.3 }}
                            />
                          )
                        ) : (
                          <UnfoldMore
                            fontSize="small"
                            style={{ opacity: 0.3 }}
                          />
                        )}
                      </IconButton>
                    )}
                  </div>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="bg-white">
          {sortedData.map((row, rowIndex) => {
            const isEvenRow = rowIndex % 2 === 0;
            return (
              <tr
                key={rowIndex}
                className={`${isEvenRow ? "" : "bg-slate-50"}`}
              >
                {graphType === "experiment" && (
                  <td className="px-4 py-3 text-gray-600 text-xs whitespace-nowrap">
                    <input
                      type="checkbox"
                      onChange={() => setSelectedRows(row)}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column}
                    className={`px-4 py-3 text-gray-600 text-xs whitespace-nowrap ${
                      editingCell?.rowIndex === rowIndex &&
                      editingCell?.column === column
                        ? "!px-2 !py-1"
                        : ""
                    } ${getCellStyle(rowIndex, column)}`}
                    onDoubleClick={() => {
                      if (isEditableColumn(column)) {
                        setEditingCell({ rowIndex, column });
                        setEditValue(flattenData(row[column] || ""));
                      }
                    }}
                  >
                    {editingCell?.rowIndex === rowIndex &&
                    editingCell?.column === column ? (
                      <input
                        type="text"
                        ref={inputRef}
                        className="w-full border border-blue-500 rounded px-2 py-1 focus:outline-none"
                        value={editValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, rowIndex, column)}
                        autoFocus
                      />
                    ) : (
                      getHighlightedText(flattenData(row[column] || ""))
                    )}
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
