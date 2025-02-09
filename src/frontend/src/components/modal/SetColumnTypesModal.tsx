import React, { useState } from "react";

type SetColumnTypesModalProps = {
  columns: string[];
  columnTypes: Record<string, string>;
  setIsModalOpen: (isOpen: boolean) => void;
  onUpdateColumnTypes: (newColumnTypes: Record<string, string>) => Promise<any>;
};

const SetColumnTypesModal: React.FC<SetColumnTypesModalProps> = ({
  columns,
  columnTypes,
  setIsModalOpen,
  onUpdateColumnTypes,
}) => {
  const filteredColumns = columns.filter(
    (column: string) =>
      column !== "_id" &&
      column !== "experimentId"
  );

  const [newColumnTypes, setNewColumnTypes] = useState<Record<string, string>>(
    () =>
      filteredColumns.reduce((acc, column) => {
        acc[column] = columnTypes[column] || "text";
        return acc;
      }, {} as Record<string, string>)
  );

  const [isChanged, setIsChanged] = useState(false);

  const handleChange = (column: string, type: string) => {
    setNewColumnTypes((prevTypes) => {
      const updatedTypes = { ...prevTypes, [column]: type };
      setIsChanged(updatedTypes[column] !== columnTypes[column]);
      return updatedTypes;
    });
  };

  const handleSubmit = async () => {
    try {
      await onUpdateColumnTypes(newColumnTypes);
      setIsModalOpen(false);
    } catch (err) {
      console.error("Error updating column types:", err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6 overflow-hidden">
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-blue-900 mb-2">
            Set Column Types
          </h1>
          <div className="flex-1 overflow-y-auto max-h-[45vh]">
            <div className="space-y-5">
              {filteredColumns.map((column: string) => (
                <section
                  key={column}
                  className="flex items-center justify-between gap-x-4"
                >
                  <div className="flex items-center gap-x-2">
                    <label className="text-blue-900 font-semibold">
                      {column}
                    </label>
                  </div>
                  <select
                    value={newColumnTypes[column]}
                    onChange={(e) => handleChange(column, e.target.value)}
                    className="min-w-[8rem] w-fit p-2 rounded-lg border border-gray-300"
                  >
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
              disabled={!isChanged}
              className="py-2 px-4 flex items-center justify-center space-x-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetColumnTypesModal;
