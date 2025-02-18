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
        acc[column] = columnTypes[0][column] || "none";
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
    try {
      setLoading(true);
      setError(false);
      const response = await onUpdateColumnTypes(newColumnTypes);
      if (response && response.success) {
        setLoading(false);
        setIsModalOpen(false);
      } else {
        setError(true);
        setLoading(false);
      }
    } catch (err) {
      setLoading(false);
      setError(true);
      console.error("Error updating column types:", err);
    }
  };

  useEffect(() => {
    const hasChanges = Object.keys(newColumnTypes).some(
      (column) =>
        newColumnTypes[column] !== "none" &&
        newColumnTypes[column] !== columnTypes[0][column]
    );
    setIsChanged(hasChanges);

    const warningCols = filteredColumns.filter(
      (column) =>
        newColumnTypes[column] !== "none" &&
        newColumnTypes[column] !== columnTypes[0][column]
    );
    setWarningColumns(warningCols);
  }, [newColumnTypes, columnTypes]);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div
        className={`bg-white rounded-lg shadow-lg max-w-md w-full p-6 overflow-hidden border-4 ${
          loading
            ? "border-yellow-500"
            : error
            ? "border-red-500"
            : "border-transparent"
        }`}
      >
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-blue-900 mb-2">
            Set Column Types
          </h1>

          {warningColumns.length > 0 && (
            <div className="p-4 mb-4 rounded-lg text-yellow-800 bg-yellow-100">
              <p className="text-sm">
                Warning: Any existing data will not be automatically converted
                to the new type for these columns:
                <ul className="max-h-[8vh] overflow-y-auto py-1">
                  {warningColumns.map((column) => (
                    <li key={column} className="font-bold">{column}</li>
                  ))}
                </ul>
              </p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto max-h-[45vh]">
            <div className="space-y-5">
              {filteredColumns.map((column: string) => (
                <section
                  key={column}
                  className="flex items-center justify-between gap-x-4 pb-2"
                >
                  <div className="flex items-center gap-x-2">
                    <label className="text-blue-900 font-semibold">
                      {column}
                    </label>
                  </div>
                  <select
                    value={newColumnTypes[column]}
                    onChange={(e) => handleChange(column, e.target.value)}
                    className={`min-w-[8rem] w-fit p-2 rounded-lg border ${
                      newColumnTypes[column] !== "none" &&
                      newColumnTypes[column] !== columnTypes[0][column]
                        ? "border-blue-500"
                        : "border-gray-300"
                    }`}
                  >
                    <option value="none" disabled>*SET TYPE*</option>
                    <option value="text">Text</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                  </select>
                </section>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="py-2 px-4 rounded-lg bg-gray-300 text-gray-900 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isChanged || loading}
              className="py-2 px-4 flex items-center justify-center space-x-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 border-t-2 border-white rounded-full"
                    viewBox="0 0 24 24"
                  />
                  <span>Saving...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetColumnTypesModal;
