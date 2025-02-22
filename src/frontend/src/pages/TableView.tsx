import React, { useState } from "react";
import Table from "../components/table/Table";
import ListSidebar from "../components/sidebars/ListSidebar";
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
  } = useTable();

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex">
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
            selectedExperiment === "Exp" ? refetchExperiments : refetchData
          }
          graphType={selectedExperiment === "Exp" ? "experiment" : "data"}
        />
      </div>
    </div>
  );
};

export default TableView;
