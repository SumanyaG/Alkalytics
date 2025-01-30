import React, { useState } from "react";
import GraphSideBar from "../components/sidebars/GraphSideBar";

type FormDataType = {
  selectedGraphType: string;
  setSelectedGraphType: (value: string) => void;
  selectedDates: string[];
  setSelectedDates: (value: string[]) => void;
  selectedParamType: string;
  setSelectedParamType: (value: string) => void;
  selectedParamX: string;
  setSelectedParamX: (value: string) => void;
  selectedParamY: string;
  setSelectedParamY: (value: string) => void;
  timeMinX: string;
  setTimeMinX: (value: string) => void;
  timeMaxX: string;
  setTimeMaxX: (value: string) => void;
  timeMinY: string;
  setTimeMinY: (value: string) => void;
  timeMaxY: string;
  setTimeMaxY: (value: string) => void;
  minX: string;
  setMinX: (value: string) => void;
  maxX: string;
  setMaxX: (value: string) => void;
  minY: string;
  setMinY: (value: string) => void;
  maxY: string;
  setMaxY: (value: string) => void;
  graphTitle: string;
  setGraphTitle: (value: string) => void;
  xLabel: string;
  setXLabel: (value: string) => void;
  yLabel: string;
  setYLabel: (value: string) => void;
  submit: boolean;
  setSubmit: (value: boolean) => void;
};

const defaultContextValue: FormDataType = {
  selectedGraphType: "",
  setSelectedGraphType: () => {},
  selectedDates: [],
  setSelectedDates: () => {},
  selectedParamType: "",
  setSelectedParamType: () => {},
  selectedParamX: "",
  setSelectedParamX: () => {},
  selectedParamY: "",
  setSelectedParamY: () => {},
  timeMinX: "",
  setTimeMinX: () => {},
  timeMaxX: "",
  setTimeMaxX: () => {},
  timeMinY: "",
  setTimeMinY: () => {},
  timeMaxY: "",
  setTimeMaxY: () => {},
  minX: "",
  setMinX: () => {},
  maxX: "",
  setMaxX: () => {},
  minY: "",
  setMinY: () => {},
  maxY: "",
  setMaxY: () => {},
  graphTitle: "",
  setGraphTitle: () => {},
  xLabel: "",
  setXLabel: () => {},
  yLabel: "",
  setYLabel: () => {},
  submit: false,
  setSubmit: () => {},
};

export const FormDataContext =
  React.createContext<FormDataType>(defaultContextValue);

const DataVisualize: React.FC = () => {
  const [selectedGraphType, setSelectedGraphType] = useState<string>("");
  const [selectedDates, setSelectedDates] = React.useState<string[]>([]);
  const [selectedParamType, setSelectedParamType] = useState<string>("");
  const [selectedParamX, setSelectedParamX] = useState<string>("");
  const [selectedParamY, setSelectedParamY] = useState<string>("");
  const [timeMinX, setTimeMinX] = useState("");
  const [timeMaxX, setTimeMaxX] = useState("");
  const [timeMinY, setTimeMinY] = useState("");
  const [timeMaxY, setTimeMaxY] = useState("");
  const [minX, setMinX] = useState("");
  const [maxX, setMaxX] = useState("");
  const [minY, setMinY] = useState("");
  const [maxY, setMaxY] = useState("");
  const [graphTitle, setGraphTitle] = useState("");
  const [xLabel, setXLabel] = useState("");
  const [yLabel, setYLabel] = useState("");
  const [submit, setSubmit] = useState(false);

  const contextValue: FormDataType = {
    selectedGraphType,
    setSelectedGraphType,
    selectedDates,
    setSelectedDates,
    selectedParamType,
    setSelectedParamType,
    selectedParamX,
    setSelectedParamX,
    selectedParamY,
    setSelectedParamY,
    timeMinX,
    setTimeMinX,
    timeMaxX,
    setTimeMaxX,
    timeMinY,
    setTimeMinY,
    timeMaxY,
    setTimeMaxY,
    minX,
    setMinX,
    maxX,
    setMaxX,
    minY,
    setMinY,
    maxY,
    setMaxY,
    graphTitle,
    setGraphTitle,
    xLabel,
    setXLabel,
    yLabel,
    setYLabel,
    submit,
    setSubmit,
  };

  return (
    <FormDataContext.Provider value={contextValue}>
      <div className="flex">
        <GraphSideBar />
        <div className="flex flex-col items-center justify-center h-screen">
          {(submit && selectedGraphType) ?? <p>{selectedGraphType}</p>}
        </div>
      </div>
    </FormDataContext.Provider>
  );
};

export default DataVisualize;
