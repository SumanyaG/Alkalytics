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
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div
        className={`bg-white rounded-lg shadow-lg max-w-xl w-full p-6 border-4 ${
          loading
            ? "border-yellow-500"
            : error
            ? "border-red-500"
            : "border-transparent"
        }`}
      >
        <h1 className="text-xl font-bold text-blue-900 mb-2">Remove Column</h1>

        <section className="mt-4">
          <label className="text-sm text-blue-900 font-semibold mb-1 block">
            Select Column to Remove
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full p-4 rounded-lg border border-gray-300"
            disabled={loading}
          >
            <option value="">Select a column</option>
            {columns.map((column) => (
              <option key={column} value={column}>
                {column.replace(/_/g, " ").toUpperCase()}
              </option>
            ))}
          </select>
          {error && (
            <p className="text-sm text-red-600 mt-2">
              ❌ Failed to remove column. Please try again.
            </p>
          )}
        </section>

        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={() => setIsModalOpen(false)}
            className="py-2 px-4 rounded-lg bg-slate-300 text-gray-900 hover:bg-slate-400"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedColumn || loading}
            className="py-2 px-4 flex items-center justify-center space-x-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                  viewBox="0 0 24 24"
                />
                <span>Removing...</span>
              </>
            ) : (
              <span>Remove Column</span>
            )}
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default RemoveColumnModal;
