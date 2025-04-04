import React, { useState } from "react";

type AddColumnModalProps = {
  setIsModalOpen: (isOpen: boolean) => void;
  onAddColumn: (columnName: string, defaultValue: any) => Promise<void>;
};

const AddColumnModal: React.FC<AddColumnModalProps> = ({
  setIsModalOpen,
  onAddColumn,
}) => {
  const [columnName, setColumnName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleSubmit = async () => {
    if (columnName.trim() === "") return;

    setLoading(true);
    setError(false);

    try {
      await onAddColumn(columnName, "");
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error adding column:", err);
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
        <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-blue-400/20 via-blue-500/20 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10">
          <h1 className="mb-4 text-xl font-bold text-blue-900">
            Add New Column
          </h1>

          <section className="mt-4">
            <label className="mb-2 block text-sm font-semibold text-blue-900">
              Column Name
            </label>
            <div className="group relative">
              <input
                type="text"
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="w-full rounded-lg border border-blue-100 bg-white/80 px-4 py-3 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Enter column name"
                disabled={loading}
              />
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
                Failed to add column. Please try again.
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
              disabled={columnName.trim() === "" || loading}
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      viewBox="0 0 24 24"
                    />
                    <span>Adding...</span>
                  </>
                ) : (
                  <span>Add Column</span>
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

export default AddColumnModal;
