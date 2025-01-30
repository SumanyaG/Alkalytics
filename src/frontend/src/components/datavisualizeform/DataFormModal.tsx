import React, { useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Stepper, Step, StepLabel, TextField, IconButton } from "@mui/material";
import SingleDropdown from "./SingleDropdown";
import MultipleSelectCheckmarks from "./MultiSelectDropDown";
import ExpandableSection from "./ExpandableSection";
import { FormDataContext } from "../../pages/DataVisualize";

interface GenerateGraphModal {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
}
const graphTypes = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "scatter", label: "Single Plot" },
];
const paramType = [
  { value: "data", label: "Data Sheet" },
  { value: "exp", label: "Experiemnt" },
];

// Temp values till endpoint created
const dateOptions = [
  "2025-01-01",
  "2025-02-14",
  "2025-03-21",
  "2025-04-05",
  "2025-05-10",
];

const datasheetParam = [
  { value: "dataSheetId", label: "Data Sheet ID" },
  { value: "experimentId", label: "Experiment ID" },
  { value: "#", label: "Number" },
  { value: "Time", label: "Time" },
  { value: "U Cmm", label: "U Cmm" },
  { value: "U Stac", label: "U Stac" },
  { value: "I Cmm", label: "I Cmm" },
  { value: "D1 Cond", label: "D1 Cond" },
  { value: "D2 Cond", label: "D2 Cond" },
  { value: "C1 Cond", label: "C1 Cond" },
  { value: "C2 Cond", label: "C2 Cond" },
  { value: "D1 pH", label: "D1 pH" },
  { value: "D2 pH", label: "D2 pH" },
  { value: "C1 pH", label: "C1 pH" },
  { value: "C2 pH", label: "C2 pH" },
  { value: "D1 Temp", label: "D1 Temp" },
  { value: "D2 Temp", label: "D2 Temp" },
  { value: "C1 Temp", label: "C1 Temp" },
  { value: "C2 Temp", label: "C2 Temp" },
  { value: "D1 Flow", label: "D1 Flow" },
  { value: "D2 Flow", label: "D2 Flow" },
  { value: "C1 Flow", label: "C1 Flow" },
  { value: "C2 Flow", label: "C2 Flow" },
  { value: "ELR Flow", label: "ELR Flow" },
  { value: "PWR PS2", label: "PWR PS2" },
  { value: "Density Modul", label: "Density Modul" },
  { value: "DIL2_PWR", label: "DIL2_PWR" },
  { value: "DIL1_PWR", label: "DIL1_PWR" },
  { value: "CON1_PWR", label: "CON1_PWR" },
  { value: "CON2_PWR", label: "CON2_PWR" },
  { value: "ELR_PWR", label: "ELR_PWR" },
];

const experimentParam = [
  { value: "experimentId", label: "Experiment ID" },
  { value: "#", label: "Number" },
  { value: "Date", label: "Date" },
  { value: "Membrane", label: "Membrane" },
  { value: "Configuration", label: "Configuration" },
  { value: "# of Stacks", label: "# of Stacks" },
  { value: "Flow Rate (L/H)", label: "Flow Rate (L/H)" },
  { value: "Potential Diff (V)", label: "Potential Diff (V)" },
  { value: "Current Limit (A)", label: "Current Limit (A)" },
  { value: "NaCL", label: "NaCL" },
  { value: "NaHCO3", label: "NaHCO3" },
  { value: "NaOH", label: "NaOH" },
  { value: "HCL", label: "HCL" },
  { value: "Na2So4", label: "Na2So4" },
  { value: "NaHCO3.1", label: "NaHCO3.1" },
  { value: "Total", label: "Total" },
];

const Input: React.FC<{
  label: string;
  children: React.ReactNode;
  description?: string;
}> = ({ label, children, description }) => {
  return (
    <div className="text-left mt-2 flex items-center justify-between mb-6">
      <div>
        <h1 className="text-l pe-2">{label}</h1>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <div className="mt-1">{children}</div>
    </div>
  );
};

const GenerateGraphModal: React.FC<GenerateGraphModal> = ({ setOpenModal }) => {
  const steps = ["Graph", "Data", "Parameters", "Customize"];
  const [activeStep, setActiveStep] = useState(0);
  const [xAxisError, setXAxisError] = useState<string | null>(null);
  const [yAxisError, setYAxisError] = useState<string | null>(null);

  // Imported states 
  const {
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
    setSubmit,
  } = useContext(FormDataContext);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const isNextDisabled = () => {
    // Disable Next button based on the required fields for the current step
    if (activeStep === 0) {
      return !selectedGraphType;
    }
    if (activeStep === 1) {
      return !selectedDates;
    }
    if (activeStep === 2) {
      return !selectedParamType || !selectedParamX || !selectedParamY;
    }
    return false;
  };

  const handlePrev = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
    if (!validateAxisRange()) {
      setXAxisError(null);
      setYAxisError(null);
    }
  };

  const handleSubmit = () => {
    if (!validateAxisRange()) {
      return; // Stop submission if validation fails
    }

    setOpenModal(false);
    const stateObject = {
      selectedGraphType,
      selectedDates,
      selectedParamType,
      selectedParamX,
      selectedParamY,
      timeMinX,
      timeMaxX,
      timeMinY,
      timeMaxY,
      minX,
      maxX,
      minY,
      maxY,
      graphTitle,
      xLabel,
      yLabel,
    };
    console.log(stateObject);
    setSubmit(true);
  };

  const handleChangeTime = (
    e: { target: { value: any } },
    setTime: (arg0: any) => void
  ) => {
    let value = e.target.value;

    // Only allow numbers and colons
    value = value.replace(/[^0-9:]/g, "");

    // Add the correct number of colons for the format (HH:mm:ss)
    if (value.length === 2 || value.length === 5) {
      value = value + ":";
    }

    // Limit the input length to 8 characters (HH:mm:ss)
    if (value.length > 8) {
      value = value.slice(0, 8);
    }
    setTime(value);
  };

  const handleChangeNum = (
    e: { target: { value: any } },
    setValue: (arg0: any) => void
  ) => {
    let value = e.target.value;

    // Only allow integers
    value = value.replace(/[^0-9]/g, "");
    setValue(value);
  };

  const validateAxisRange = () => {
    let isValid = true;

    // Validate X Axis
    if (selectedParamX === "Time") {
      const timeMinXSeconds = timeStringToSeconds(timeMinX);
      const timeMaxXSeconds = timeStringToSeconds(timeMaxX);
      if (timeMinXSeconds > timeMaxXSeconds) {
        setXAxisError("Min time cannot be greater than max time.");
        isValid = false;
      } else {
        setXAxisError(null);
      }
    } else {
      if (Number(minX) > Number(maxX)) {
        setXAxisError("Min value cannot be greater than max value.");
        isValid = false;
      } else {
        setXAxisError(null);
      }
    }

    // Validate Y Axis
    if (selectedParamY === "Time") {
      const timeMinYSeconds = timeStringToSeconds(timeMinY);
      const timeMaxYSeconds = timeStringToSeconds(timeMaxY);
      if (timeMinYSeconds > timeMaxYSeconds) {
        setYAxisError("Min time cannot be greater than max time.");
        isValid = false;
      } else {
        setYAxisError(null);
      }
    } else {
      if (Number(minY) > Number(maxY)) {
        setYAxisError("Min value cannot be greater than max value.");
        isValid = false;
      } else {
        setYAxisError(null);
      }
    }

    return isValid;
  };

  const timeStringToSeconds = (time: string): number => {
    const [hours, minutes, seconds] = time.split(":").map(Number);
    return hours * 3600 + minutes * 60 + seconds;
  };

  return (
    <div className="w-screen h-screen bg-gray-200 bg-opacity-50 fixed flex justify-center items-center">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg flex flex-col p-5 ">
        <div className="flex justify-between items-center border-b">
          <h1 className="text-xl">Generate Graph</h1>
          <IconButton
            onClick={() => {
              setOpenModal(false);
            }}
          >
            <CloseIcon />
          </IconButton>
        </div>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index} className="mt-8">
              <StepLabel className="mb-4">{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className="my-6">
          {/* Graph */}
          {activeStep === 0 && (
            <Input
              label="Type of Graph"
              description="Select the graph to display the data"
              children={
                <SingleDropdown
                  options={graphTypes}
                  label="Graph Type"
                  required={true}
                  onChange={setSelectedGraphType}
                />
              }
            />
          )}
          {/* Data */}
          {activeStep === 1 && (
            <Input
              label="Experiment Dates"
              description=" Select the experimental date(s) of the datasheet(s)"
              children={
                <MultipleSelectCheckmarks
                  dates={dateOptions}
                  required={true}
                  values={selectedDates}
                  onChange={setSelectedDates}
                />
              }
            />
          )}
          {/* Parameters */}
          {activeStep === 2 && (
            <div>
              <Input
                label="Parameter Type"
                description="Use datasheet or experiment parameter"
                children={
                  <SingleDropdown
                    options={paramType}
                    label="Param Type"
                    required={true}
                    onChange={setSelectedParamType}
                  />
                }
              />
              <Input
                label="Compare Parameters"
                description="Select axis parameters"
                children={
                  <div>
                    <SingleDropdown
                      options={
                        selectedParamType === "data"
                          ? datasheetParam
                          : experimentParam
                      }
                      label="X"
                      required={true}
                      onChange={setSelectedParamX}
                    />
                    <SingleDropdown
                      options={
                        selectedParamType === "data"
                          ? datasheetParam
                          : experimentParam
                      }
                      label="Y"
                      required={true}
                      onChange={setSelectedParamY}
                    />
                  </div>
                }
              />
            </div>
          )}

          {/* Parameters */}
          {activeStep === 3 && (
            <div>
              <div className="flex items-center mb-6 justify-between">
                <h2 className="text-l pe-2">Graph Title</h2>
                <TextField
                  label="Title"
                  margin="dense"
                  variant="outlined"
                  onChange={(e) => {
                    setGraphTitle(e.target.value);
                  }}
                />
              </div>

              <div className="mb-4 border-b">
                <h2>Custom Axis Settings</h2>
              </div>
              <ExpandableSection
                title="Axis Range"
                description="Will take min and max values from data set as default"
                content={
                  <div>
                    <div className="flex items-center mb-6 justify-between">
                      <div className="mr-4">
                        <h2 className="text-l pe-2">X Axis Range</h2>
                        <p className="text-slate-500 text-sm">
                          Set values for the range of the axis
                        </p>
                        {xAxisError && (
                          <p className="text-red-500 text-sm">{xAxisError}</p>
                        )}
                      </div>
                      {selectedParamX === "Time" ? (
                        <div className="flex justify-between">
                          <TextField
                            sx={{ maxWidth: 120, marginRight: 4 }}
                            label="Min"
                            value={timeMinX}
                            onChange={(e) => handleChangeTime(e, setTimeMinX)}
                            placeholder="HH:mm:ss"
                            margin="dense"
                            size="small"
                          />
                          <TextField
                            label="Max"
                            value={timeMaxX}
                            onChange={(e) => handleChangeTime(e, setTimeMaxX)}
                            placeholder="HH:mm:ss"
                            margin="dense"
                            size="small"
                            sx={{ maxWidth: 120 }}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <TextField
                            sx={{ maxWidth: 120, marginRight: 4 }}
                            label="Min"
                            value={minX}
                            onChange={(e) => handleChangeNum(e, setMinX)}
                            margin="dense"
                            size="small"
                          />
                          <TextField
                            sx={{ maxWidth: 120 }}
                            label="Max"
                            value={maxX}
                            onChange={(e) => handleChangeNum(e, setMaxX)}
                            margin="dense"
                            size="small"
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center mb-6 justify-between">
                      <div className="mr-4">
                        <h2 className="text-l pe-2">Y Axis Range</h2>
                        <p className="text-slate-500 text-sm">
                          Set values for the range of the axis
                        </p>
                        {yAxisError && (
                          <p className="text-red-500 text-sm">{yAxisError}</p>
                        )}
                      </div>
                      {selectedParamY === "Time" ? (
                        <div className="flex justify-between">
                          <TextField
                            sx={{ maxWidth: 120, marginRight: 4 }}
                            label="Min"
                            value={timeMinY}
                            onChange={(e) => handleChangeTime(e, setTimeMinY)}
                            placeholder="HH:mm:ss"
                            margin="dense"
                            size="small"
                          />
                          <TextField
                            label="Max"
                            value={timeMaxY}
                            onChange={(e) => handleChangeTime(e, setTimeMaxY)}
                            placeholder="HH:mm:ss"
                            margin="dense"
                            size="small"
                            sx={{ maxWidth: 120 }}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-between">
                          <TextField
                            sx={{ maxWidth: 120, marginRight: 4 }}
                            label="Min"
                            value={minY}
                            onChange={(e) => handleChangeNum(e, setMinY)}
                            margin="dense"
                            size="small"
                          />
                          <TextField
                            sx={{ maxWidth: 120 }}
                            label="Max"
                            value={maxY}
                            onChange={(e) => handleChangeNum(e, setMaxY)}
                            margin="dense"
                            size="small"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                }
              />
              <ExpandableSection
                title="Axis Labels"
                content={
                  <div>
                    <div className="flex items-center mb-6 justify-between">
                      <h2 className="text-l pe-2">X Axis Label</h2>
                      <TextField
                        label="X Axis"
                        margin="dense"
                        variant="outlined"
                        onChange={(e) => {
                          setXLabel(e.target.value);
                        }}
                      />
                    </div>
                    <div className="flex items-center mb-6 justify-between">
                      <h2 className="text-l pe-2">Y Axis Label</h2>
                      <TextField
                        label="Y Axis"
                        margin="dense"
                        variant="outlined"
                        onChange={(e) => {
                          setYLabel(e.target.value);
                        }}
                      />
                    </div>
                  </div>
                }
              />
            </div>
          )}
        </div>

        <div className="flex justify-between">
          <button
            onClick={handlePrev}
            className={`py-2 px-4 rounded-lg ${
              activeStep === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>

          <button
            onClick={
              activeStep === steps.length - 1 ? handleSubmit : handleNext
            }
            disabled={isNextDisabled()}
            className={`py-2 px-4 rounded-lg flex items-center justify-center ${
              activeStep === steps.length - 1
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-blue-600 text-white hover:bg-blue-700"
            } ${
              isNextDisabled()
                ? "opacity-50 cursor-not-allowed bg-gray-400"
                : ""
            }`}
          >
            {activeStep === steps.length - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateGraphModal;
