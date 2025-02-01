import React, { useState, useMemo, useEffect } from "react";
import "tailwindcss/tailwind.css";
import { gql, useMutation } from "@apollo/client";
import TableBody from "./TableBody";
import TableFooter from "./TableFooter";
import AddColumnModal from "../modal/AddColumnModal";
import AddRowModal from "../modal/AddRowModal";
import RemoveColumnModal from "../modal/RemoveColumnModal";
import RemoveRowModal from "../modal/RemoveRowModal";
import TableHeader from "./TableHeader";

export type DataRow = Record<string, string | number | undefined | null>;

export const ADD_COLUMN = gql`
  mutation AddColumn($columnName: String!, $defaultValue: JSON) {
    addColumn(columnName: $columnName, defaultValue: $defaultValue)
  }
`;

export const ADD_ROW = gql`
  mutation AddRow($rowData: JSON!) {
    addRow(rowData: $rowData)
  }
`;

export const REMOVE_COLUMN = gql`
  mutation RemoveColumn($columnName: String!) {
    removeColumn(columnName: $columnName)
  }
`;

export const REMOVE_ROW = gql`
  mutation RemoveRow($experimentIds: [String]!) {
    removeRow(experimentIds: $experimentIds)
  }
`;

type TableProps = {
  tableName: string;
  data: DataRow[];
  isOpen?: boolean;
  refetchData: () => void;
  graphType?: string;
};

const Table: React.FC<TableProps> = ({
  tableName,
  data,
  refetchData,
  graphType,
}) => {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [debouncedKeyword, setDebouncedKeyword] = useState("");
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
  const [isRowModalOpen, setIsRowModalOpen] = useState(false);
  const [isRemoveColumnModalOpen, setIsRemoveColumnModalOpen] = useState(false);
  const [isRemoveRowModalOpen, setIsRemoveRowModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  const [addColumn] = useMutation(ADD_COLUMN);
  const [addRow] = useMutation(ADD_ROW);
  const [removeColumn] = useMutation(REMOVE_COLUMN);
  const [removeRow] = useMutation(REMOVE_ROW);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  const columns = useMemo(() => {
    const defaultColumns = data.length > 0 ? Object.keys(data[0]) : [];
    return defaultColumns;
  }, [data]);

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

  const handleAddColumn = async (columnName: string, defaultValue: any) => {
    try {
      const { data } = await addColumn({
        variables: { columnName, defaultValue },
      });
      if (data.addColumn) {
        refetchData();
      }
    } catch (error) {
      console.error("Error adding column:", error);
    }
  };

  const handleAddRow = async (newRowData: Record<string, string | number>) => {
    setIsRowModalOpen(false);
    try {
      const { data } = await addRow({
        variables: { rowData: newRowData },
      });
      if (data.addRow) {
        refetchData();
      }
    } catch (error) {
      console.error("Error adding row:", error);
    }
  };

  const handleRemoveColumn = async (columnName: string) => {
    try {
      const { data } = await removeColumn({
        variables: { columnName },
      });
      if (data.removeColumn) {
        refetchData();
      }
    } catch (error) {
      console.error("Error removing column:", error);
    }
  };

  const handleRemoveRow = async (experimentIds: string[]) => {
    try {
      console.log(experimentIds);
      const { data } = await removeRow({
        variables: { experimentIds },
      });
      if (data.removeRow) {
        refetchData();
      }
    } catch (error) {
      console.error("Error removing row:", error);
    }
  };

  const handleRowSelectionChange = (row: any) => {
    const rowId = String(row.experimentId);
    const newSelectedRows = new Set(selectedRows);
    if (newSelectedRows.has(rowId)) {
      newSelectedRows.delete(rowId);
    } else {
      newSelectedRows.add(rowId);
    }
    setSelectedRows(newSelectedRows);
  };

  return (
    <div className="h-screen flex flex-col items-center min-h-screen w-full p-8 text-blue-900">
      <div className="w-full shadow-lg rounded-lg flex flex-col overflow-hidden border-gray-300 bg-white h-full">
        <TableHeader
          columns={columns}
          tableName={tableName}
          selectedColumn={selectedColumn}
          setSelectedColumn={setSelectedColumn}
          searchKeyword={searchKeyword}
          setSearchKeyword={setSearchKeyword}
        />
        <div style={{ flex: 1, overflow: "hidden" }}>
          <TableBody
            columns={columns}
            data={filteredData}
            highlightKeyword={debouncedKeyword}
            refetchData={refetchData}
            graphType={graphType}
            selectedRows={selectedRows}
            setSelectedRows={handleRowSelectionChange}
          />
        </div>
        <TableFooter
          data={data}
          columns={columns}
          onAddColumn={() => setIsColumnModalOpen(true)}
          onAddRow={() => setIsRowModalOpen(true)}
          onRemoveColumn={() => setIsRemoveColumnModalOpen(true)}
          onRemoveRow={() => setIsRemoveRowModalOpen(true)}
          selectedRows={selectedRows}
          graphType={graphType}
        />
      </div>

      {/* Add Column Modal */}
      {isColumnModalOpen && (
        <AddColumnModal
          setIsModalOpen={setIsColumnModalOpen}
          onAddColumn={handleAddColumn}
        />
      )}

      {/* Add Row Modal */}
      {isRowModalOpen && (
        <AddRowModal
          data={data}
          columns={columns}
          setIsModalOpen={setIsRowModalOpen}
          onAddRow={handleAddRow}
        />
      )}

      {/* Remove Column Modal */}
      {isRemoveColumnModalOpen && (
        <RemoveColumnModal
          columns={columns}
          setIsModalOpen={setIsRemoveColumnModalOpen}
          onRemoveColumn={handleRemoveColumn}
        />
      )}

      {/* Remove Row Modal */}
      {isRemoveRowModalOpen && (
        <RemoveRowModal
          setIsModalOpen={setIsRemoveRowModalOpen}
          selectedRows={selectedRows}
          onRemoveRow={handleRemoveRow}
        />
      )}
    </div>
  );
};

export default Table;
