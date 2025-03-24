import React, { useState } from "react";
import Table from "../components/table/Table";
import ListSidebar from "../components/sidebar/ListSidebar";
import useTable from "../hooks/useTable";

type TableViewProps = {};

const TableView: React.FC<TableViewProps> = () => {
  const {
    ids,
    selectedExperiment,
    sortedData,
    tableName,
    handleSelectExperiment,
    refetchData,
    refetchExperiments,
    refetchEfficiencies,
  } = useTable();

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex bg-white">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-200 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-200 blur-3xl"></div>
      <ListSidebar
        experimentIds={ids}
        selectedExperiment={selectedExperiment}
        onSelectExperiment={handleSelectExperiment}
        isOpen={isOpen}
        onToggleSidebar={setIsOpen}
      />
      <div
        className="transition-all duration-300 w-full"
        style={{
          maxWidth: `calc(100% - ${isOpen ? "18rem" : "5rem"})`,
        }}
      >
        <Table
          tableName={tableName}
          data={sortedData}
          refetchData={
            selectedExperiment === "Exp"
              ? refetchExperiments
              : selectedExperiment === "Efficiency Calculations"
              ? refetchEfficiencies
              : refetchData
          }
          graphType={selectedExperiment === "Exp" ? "experiment" : "data"}
        />
      </div>
    </div>
  );
};

export default TableView;
