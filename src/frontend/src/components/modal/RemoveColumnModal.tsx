// -----------------------------------------------------------------------------
// Primary Author: Jason T
// Year: 2025
// Component: RemoveColumnModal
// Purpose: Modal component for removing a column from Table.
// -----------------------------------------------------------------------------

import React, { useState } from "react";

type RemoveColumnModalProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  onRemoveColumn: (columnName: string) => Promise<void>;
  columns: string[];
};

const RemoveColumnModal: React.FC<RemoveColumnModalProps> = ({
  setIsModalOpen,
  onRemoveColumn,
  columns,
}) => {
  const [selectedColumn, setSelectedColumn] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (!selectedColumn) return;

    setLoading(true);
    setError(false);

    try {
      await onRemoveColumn(selectedColumn);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error removing column:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`relative w-full max-w-md overflow-hidden rounded-xl border-4 border-white/20 bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all duration-300 ${
          loading
            ? "ring-2 ring-yellow-300"
            : error
            ? "ring-2 ring-red-300"
            : ""
        }`}
      >
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(219,234,254,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(219,234,254,0.03)_1px,transparent_1px)] bg-[size:20px_20px] opacity-70"></div>
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-red-400/20 via-red-500/20 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-4 text-xl font-bold text-blue-900">
            Remove Column
          </h1>

          <section className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-blue-900">
              Select Column to Remove
            </label>
            <div className="relative">
              <select
                value={selectedColumn}
                onChange={(e) => setSelectedColumn(e.target.value)}
                className="w-full appearance-none rounded-lg border border-blue-100 bg-white/80 px-4 py-3 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                disabled={loading}
              >
                <option value="">Select a column</option>
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
            {error && (
              <p className="mt-2 flex items-center text-sm text-red-500">
                <svg
                  className="mr-1.5 h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Failed to remove column. Please try again.
              </p>
            )}
          </section>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-100 transition-all hover:bg-blue-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedColumn || loading}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-red-500 to-red-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      viewBox="0 0 24 24"
                    />
                    <span>Removing...</span>
                  </>
                ) : (
                  <span>Remove Column</span>
                )}
              </span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-red-400 to-red-500 opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-disabled:opacity-0"></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RemoveColumnModal;
