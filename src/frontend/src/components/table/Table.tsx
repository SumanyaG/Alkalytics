import React, { useState, useMemo, useEffect } from "react";
import { gql, useMutation, useQuery } from "@apollo/client";
import TableBody from "./TableBody";
import TableFooter from "./TableFooter";
import AddColumnModal from "../modal/AddColumnModal";
import AddRowModal from "../modal/AddRowModal";
import RemoveColumnModal from "../modal/RemoveColumnModal";
import RemoveRowModal from "../modal/RemoveRowModal";
import TableHeader from "./TableHeader";
import SetColumnTypesModal from "../modal/SetColumnTypesModal";
import EfficiencyModal from "../modal/EfficiencyModal";
import useTable from "../../hooks/useTable";

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

export const UPDATE_DATA = gql`
  mutation UpdateData($updatedData: JSON!) {
    updateData(updatedData: $updatedData)
  }
`;

export const SET_COLUMN_TYPES = gql`
  mutation SetColumnTypes($newColumnTypes: JSON!) {
    setColumnTypes(newColumnTypes: $newColumnTypes)
  }
`;

export const COMPUTE_EFF = gql`
  mutation ComputeEfficiency($experimentId: String!, $selectedEfficiencies: [String!]!, $timeInterval: Int!) {
    computeEfficiency(experimentId: $experimentId, selectedEfficiencies: $selectedEfficiencies, timeInterval: $timeInterval)
  }
`;

const GET_COLUMN_TYPES = gql`
  query GetColumnTypes {
    getColumnTypes
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
  const [isColumnTypesModalOpen, setIsColumnTypesModalOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [isEfficiencyModalOpen, setIsEfficiencyModalOpen] = useState(false);

  const [addColumn] = useMutation(ADD_COLUMN);
  const [addRow] = useMutation(ADD_ROW);
  const [removeColumn] = useMutation(REMOVE_COLUMN);
  const [removeRow] = useMutation(REMOVE_ROW);
  const [updateData] = useMutation(UPDATE_DATA);
  const [setColumnTypes] = useMutation(SET_COLUMN_TYPES);
  const [computeEfficiency] = useMutation(COMPUTE_EFF);

  const { ids } = useTable();

  const { data: columnTypesData, refetch } = useQuery<{
    getColumnTypes: Record<string, string>[];
  }>(GET_COLUMN_TYPES);
  const columnTypes = columnTypesData?.getColumnTypes || [];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedKeyword(searchKeyword);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchKeyword]);

  const columns = useMemo(() => {
    if (data.length === 0) return [];

    const keys = Object.keys(data[0]);
    return keys
      .filter((k) => k !== "Notes")
      .concat(keys.includes("Notes") ? ["Notes"] : []);
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

  const handleUpdateData = async (updatedData: Record<string, unknown>) => {
    try {
      const { data } = await updateData({
        variables: {
          updatedData,
        },
      });

      if (data.updateData) {
        refetchData();
      }
    } catch (error) {
      console.error("Error updating rows:", error);
    }
  };

  const handleAddColumn = async (
    columnName: string,
    defaultValue: string | number | undefined | null
  ) => {
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

  const handleSetColumnTypes = async (
    newColumnTypes: Record<string, string>
  ) => {
    try {
      const { data } = await setColumnTypes({
        variables: { newColumnTypes },
      });
      if (data.setColumnTypes) {
        setIsColumnTypesModalOpen(false);
        refetch();
      }
    } catch (error) {
      console.error("Error updating column types:", error);
    }
  };

  const handleCompute = async (
    experimentId: string,
    selectedEfficiencies: string[],
    timeInterval: number
  ) => {
    try {
      console.log("handleCompute: Arguments passed to mutation:", {
        experimentId,
        selectedEfficiencies,
        timeInterval,
      });
      const { data } = await computeEfficiency({
        variables: { experimentId, selectedEfficiencies, timeInterval },
      });
      if (data.computeEfficiency) {
        setIsEfficiencyModalOpen(false);
        refetchData();
      }
    } catch (error) {
      console.error("Error computing efficiencies:", error);
    }
  };

  const handleRowSelectionChange = (row: DataRow) => {
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
    <div className="flex h-screen min-h-screen w-full flex-col items-center p-8 text-blue-900">
      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/20 bg-white/95 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(219,234,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(219,234,254,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70"></div>
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400/20 via-blue-500/10 to-transparent"></div>
        <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-blue-400/20 via-blue-500/10 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full">
          <TableHeader
            columns={columns}
            tableName={tableName}
            selectedColumn={selectedColumn}
            setSelectedColumn={setSelectedColumn}
            searchKeyword={searchKeyword}
            setSearchKeyword={setSearchKeyword}
            onSetColumnTypes={() => setIsColumnTypesModalOpen(true)}
            graphType={graphType}
          />
          <div style={{ flex: 1, overflow: "hidden" }}>
            <TableBody
              columns={columns}
              columnTypes={columnTypes}
              data={filteredData}
              highlightKeyword={debouncedKeyword}
              graphType={graphType}
              selectedRows={selectedRows}
              setSelectedRows={handleRowSelectionChange}
              onUpdateCell={handleUpdateData}
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
            onApplyFunction={handleUpdateData}
            onComputeEfficiency={() => setIsEfficiencyModalOpen(true)}
          />
        </div>
      </div>

      {isColumnTypesModalOpen && (
        <SetColumnTypesModal
          columns={columns}
          columnTypes={columnTypes}
          setIsModalOpen={setIsColumnTypesModalOpen}
          onUpdateColumnTypes={handleSetColumnTypes}
        />
      )}

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
          columnTypes={columnTypes}
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

      {/* Efficiency Modal */}
      {isEfficiencyModalOpen && (
        <EfficiencyModal 
          setIsModalOpen={setIsEfficiencyModalOpen}
          experiments={ids}
          onComputeEfficiencies={handleCompute}/>
      )}
    </div>
  );
};

export default Table;
