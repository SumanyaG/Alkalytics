import React, { useState, useEffect, useRef } from "react";

type DataRow = {
  [key: string]: string | string[] | { [key: string]: string };
};

type TableHeaderProps = {
  columns: string[];
  data: DataRow[];
  allSelected: boolean;
  onToggleAll: () => void;
};

const TableHeader: React.FC<TableHeaderProps> = ({
  columns,
  data,
  allSelected,
  onToggleAll,
}) => {
  const [columnWidths, setColumnWidths] = useState<number[]>([]);
  const [tableWidth, setTableWidth] = useState<number>(window.innerWidth);

  const flattenData = (
    value: number | string | string[] | Record<string, string>
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

  useEffect(() => {
    const handleResize = () => {
      setTableWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const calculateMaxWidth = () => {
      const newColumnWidths = columns.map((column, index) => {
        if (column === "#") {
          return 8;
        }

        let maxWidth = 0;

        data.forEach((row) => {
          const cellValue = flattenData(row[column] || "");
          maxWidth = Math.max(maxWidth, cellValue.length * 12);
        });

        return maxWidth;
      });

      const totalFixedWidth = newColumnWidths
        .slice(0, -1)
        .reduce((sum, width) => sum + width, 0);
      const lastColumnWidth = tableWidth - totalFixedWidth;

      if (lastColumnWidth > 50) {
        newColumnWidths[newColumnWidths.length - 1] = lastColumnWidth;
      } else {
        newColumnWidths[newColumnWidths.length - 1] = 150;
      }

      setColumnWidths(newColumnWidths);
    };

    calculateMaxWidth();
  }, [columns, data, tableWidth]);

  const handleMouseDown = (index: number, event: React.MouseEvent) => {
    const startX = event.clientX;
    const startWidth = columnWidths[index];

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      setColumnWidths((prevWidths) => {
        const newWidths = [...prevWidths];
        newWidths[index] = Math.max(50, startWidth + delta);
        return newWidths;
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  return (
    <thead className="text-md bg-white border-b border-gray-100 text-blue-900">
      <tr className="">
        <th
          className="!font-normal text-blue-800 relative px-2 py-1.5 text-sm  shadow-lg"
          style={{
            width: columnWidths[0] || 50,
            padding: "1px 8px",
          }}
        >
          <div className="flex items-center justify-center">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={onToggleAll}
              className="cursor-pointer"
            />
          </div>
        </th>

        {columns.slice(1).map((column, index) => (
          <th
            key={column}
            className="!font-semibold text-blue-900 relative px-4 py-4 text-sm"
            style={{
              width: columnWidths[index + 1] || 150,
            }}
          >
            <div className="flex items-center justify-between">
              {formatColumnHeader(column)}
              <span
                className="absolute top-0 right-0 h-full w-1 bg-transparent hover:bg-blue-500 cursor-col-resize"
                onMouseDown={(event) => handleMouseDown(index + 1, event)}
              />
            </div>
          </th>
        ))}

        <th
          className="!font-normal text-blue-800 relative px-4 py-3 text-sm  shadow-lg"
          style={{
            width: columnWidths[columnWidths.length - 1] || 150,
          }}
        ></th>
      </tr>
    </thead>
  );
};

export default TableHeader;
