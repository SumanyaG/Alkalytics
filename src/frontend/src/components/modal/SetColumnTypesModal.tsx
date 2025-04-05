// -----------------------------------------------------------------------------
// Primary Author: Kate M
// Year: 2025
// Component: SetColumnTypesModal
// Purpose: Modal component for setting column types in Table.
// -----------------------------------------------------------------------------

import React, { useEffect, useState } from "react";

type SetColumnTypesModalProps = {
  columns: string[];
  columnTypes: Record<string, string>[];
  setIsModalOpen: (isOpen: boolean) => void;
  onUpdateColumnTypes: (newColumnTypes: Record<string, string>) => Promise<any>;
};

const SetColumnTypesModal: React.FC<SetColumnTypesModalProps> = ({
  columns,
  columnTypes,
  setIsModalOpen,
  onUpdateColumnTypes,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isChanged, setIsChanged] = useState(false);
  const [warningColumns, setWarningColumns] = useState<string[]>([]);

  const filteredColumns = columns.filter(
    (column: string) => column !== "_id" && column !== "experimentId"
  );

  const [newColumnTypes, setNewColumnTypes] = useState<Record<string, string>>(
    () =>
      filteredColumns.reduce((acc, column) => {
        acc[column] = columnTypes[0]?.[column] || "none";
        return acc;
      }, {} as Record<string, string>)
  );

  const handleChange = (column: string, type: string) => {
    setNewColumnTypes((prevTypes) => ({
      ...prevTypes,
      [column]: type,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await onUpdateColumnTypes(newColumnTypes);
      if (response) {
        setIsModalOpen(false);
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
      console.error("Error updating column types:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasChanges = Object.keys(newColumnTypes).some(
      (column) =>
        newColumnTypes[column] !== "none" &&
        newColumnTypes[column] !== columnTypes[0]?.[column]
    );
    setIsChanged(hasChanges);

    const warningCols = filteredColumns.filter(
      (column) =>
        newColumnTypes[column] !== "none" &&
        newColumnTypes[column] !== columnTypes[0]?.[column]
    );
    setWarningColumns(warningCols);
  }, [newColumnTypes, columnTypes]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`w-full max-w-md overflow-hidden rounded-xl border-4 bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm ${
          loading
            ? "border-yellow-500/50"
            : error
            ? "border-red-500/50"
            : "border-white/20"
        }`}
      >
        <div className="flex flex-col">
          <h1 className="mb-4 text-xl font-bold text-blue-900">
            Set Column Types
          </h1>

          {warningColumns.length > 0 && (
            <div className="p-4 mb-4 rounded-lg text-yellow-800 bg-yellow-100">
              <p className="text-sm">
                Warning: Any existing data will not be automatically converted
                to the new type for these columns:
                <ul className="max-h-[8vh] overflow-y-auto py-1">
                  {warningColumns.map((column) => (
                    <li key={column} className="font-bold">
                      {column}
                    </li>
                  ))}
                </ul>
              </p>
            </div>
          )}

          <div className="max-h-[45vh] flex-1 overflow-y-auto pr-2">
            <div className="space-y-4">
              {filteredColumns.map((column: string) => (
                <section
                  key={column}
                  className={`flex items-center justify-between gap-x-4 rounded-lg border p-3 transition-all ${
                    newColumnTypes[column] !== "none" &&
                    newColumnTypes[column] !== columnTypes[0]?.[column]
                      ? "border-blue-100 bg-blue-50/50"
                      : "border-blue-50 bg-blue-50/30 hover:border-blue-100 hover:bg-blue-50/50"
                  }`}
                >
                  <div className="flex items-center gap-x-2">
                    <label className="font-semibold text-blue-900">
                      {column}
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      value={newColumnTypes[column]}
                      onChange={(e) => handleChange(column, e.target.value)}
                      className="h-10 w-32 appearance-none rounded-lg border border-blue-100 bg-white/80 pl-3 pr-10 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                    >
                      <option value="none" disabled>
                        *SET TYPE*
                      </option>
                      <option value="text">Text</option>
                      <option value="number">Number</option>
                      <option value="date">Date</option>
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
                </section>
              ))}
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
              disabled={!isChanged || loading}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                    viewBox="0 0 24 24"
                  />
                  <span className="relative z-10">Saving...</span>
                </div>
              ) : (
                <>
                  <span className="relative z-10">Save Changes</span>
                  <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-400 to-blue-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetColumnTypesModal;
