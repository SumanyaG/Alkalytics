import React, { useState, useEffect } from "react";
import { DataRow } from "../table/Table";

type AddRowModalProps = {
  columns: string[];
  columnTypes: Record<string, string>[];
  data: DataRow[];
  setIsModalOpen: (isOpen: boolean) => void;
  onAddRow: (newRow: Record<string, string | number>) => Promise<any>;
};

const AddRowModal: React.FC<AddRowModalProps> = ({
  data,
  columns,
  columnTypes,
  setIsModalOpen,
  onAddRow,
}) => {
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<Record<string, string | null>>({});
  const [newRowData, setNewRowData] = useState<Record<string, string | number>>(
    columns.reduce((acc, column) => {
      acc[column] = "";
      return acc;
    }, {} as Record<string, string | number>)
  );

  const handleChange = (column: string, value: string | number) => {
    if (value === "") {
      setNewRowData((prevData) => ({ ...prevData, [column]: value }));
      setErrorMessage((prevMessage) => ({ ...prevMessage, [column]: null }));
      return;
    }

    let newValue = value;
    if (typeof value === "string" && !isNaN(Number(value))) {
      newValue = Number(value);
    }

    const expectedType = columnTypes[0][column];
    let isValid = true;
    if (expectedType === "number") {
      isValid = typeof newValue === "number" && !isNaN(newValue);
    } else if (expectedType === "date") {
      isValid = !isNaN(Date.parse(value as string));
    } else if (expectedType === "text") {
      isValid = typeof newValue === "string";
    }

    if (!isValid) {
      setErrorMessage((prevMessage) => ({
        ...prevMessage,
        [column]: `Invalid input for ${column}. Expecting ${expectedType}.`
      }));
      return;
    }

    setErrorMessage((prevMessage) => ({ ...prevMessage, [column]: null }));
    setNewRowData((prevData) => ({ ...prevData, [column]: newValue }));
  };

  useEffect(() => {
    const isDuplicate = data.some((row) => row["#"] == newRowData["#"]);
    setIsDuplicate(isDuplicate);
  }, [newRowData["#"], data]);

  const handleSubmit = async () => {
    setLoading(true);
    setError(false);

    const experimentId = `#${newRowData["#"]} ${newRowData["Date"]}`;
    const newRow = { ...newRowData, experimentId };

    try {
      const response = await onAddRow(newRow);
      if (response && response.success) {
        setIsModalOpen(false);
      } else {
        setError(true);
      }
    } catch (error) {
      console.error("Error adding row:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`w-full max-w-xl overflow-hidden rounded-xl border bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all ${
          loading
            ? "border-yellow-300/50"
            : error
            ? "border-red-300/50"
            : "border-white/20"
        }`}
      >
        <div className="flex flex-col h-full">
          <h1 className="mb-4 text-xl font-bold text-blue-900">Add New Row</h1>
          <div className="max-h-[45vh] flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {columns.map((column) => {
                if (column === "_id") return null;
                if (column === "experimentId") {
                  return (
                    <section key={column} className="col-span-full">
                      <h2 className="mb-1 text-sm font-semibold text-blue-700">
                        {column.replace(/_/g, " ").toUpperCase()}
                      </h2>
                      <input
                        type="text"
                        value={`#${newRowData["#"]} ${newRowData["Date"]}`}
                        readOnly
                        className="w-full rounded-lg border border-blue-100 bg-blue-50/30 px-4 py-2 text-sm text-blue-900"
                      />
                    </section>
                  );
                }

                return (
                  <section key={column}>
                    <h2 className="mb-1 text-sm font-semibold text-blue-700">
                      {column.replace(/_/g, " ").toUpperCase()}
                    </h2>
                    <input
                      type={
                        columnTypes[0][column] === "number"
                          ? "number"
                          : columnTypes[0][column] === "date"
                          ? "date"
                          : "text"
                      }
                      onWheel={(e) => (e.target as HTMLElement).blur()}   //disables mousewheel scroll for number inputs
                      value={newRowData[column]}
                      onChange={(e) => handleChange(column, e.target.value)}
                      className="w-full rounded-lg border border-blue-100 bg-white/80 px-4 py-2 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                    {column === "#" && isDuplicate && (
                      <p className="mt-1 text-xs text-red-500">
                        This # value already exists.
                      </p>
                    )}
                    {errorMessage[column] && (
                      <p className="text-red-500 text-xs mt-1">
                        {errorMessage[column]}
                      </p>
                    )}
                  </section>
                );
              })}
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-blue-100 transition-all hover:bg-blue-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                isDuplicate ||
                !newRowData["#"] ||
                !newRowData["Date"] ||
                loading
              }
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      viewBox="0 0 24 24"
                    />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <span>Submit</span>
                )}
              </span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddRowModal;
