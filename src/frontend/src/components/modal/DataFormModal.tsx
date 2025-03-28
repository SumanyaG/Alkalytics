import React, { useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Stepper, Step, StepLabel, TextField, IconButton } from "@mui/material";
import SingleDropdown from "../dropdown/SingleDropdown";
import ExpandableSection from "../expandable/ExpandableSection";
import { FormDataContext } from "../../pages/DataVisualize";
import { useQuery, gql } from "@apollo/client";

interface GenerateGraphModal {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: any;
}
const graphTypes = [
  { value: "bar", label: "Bar Chart" },
  { value: "line", label: "Line Chart" },
  { value: "scatter", label: "Single Plot" },
];
const paramType = [
  { value: "data", label: "Data Sheet" },
  { value: "experiments", label: "Experiment" },
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

const GET_ATTRS = gql`
  query GetCollectionAttrs($collection: String!) {
    getCollectionAttrs(collection: $collection)
  }
`;

const GET_ATTR_VALUES = gql`
  query GetFilterCollectionAttrValues(
    $attribute: String!
    $collection: String!
  ) {
    getFilterCollectionAttrValues(
      attribute: $attribute
      collection: $collection
    )
  }
`;
const GenerateGraphModal: React.FC<GenerateGraphModal> = ({
  setOpenModal,
  onSubmit,
}) => {
  // Imported states
  const {
    selectedGraphType,
    setSelectedGraphType,
    selectedParamType,
    setSelectedParamType,
    selectedParamX,
    setSelectedParamX,
    selectedParamY,
    setSelectedParamY,
    xValue,
    setXValue,
    yValue,
    setYValue,
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
    setGraphTitle,
    setXLabel,
    setYLabel,
  } = useContext(FormDataContext);

  const { data: dataAttr } = useQuery<{ getCollectionAttrs: any[] }>(
    GET_ATTRS,
    { variables: { collection: "data" } }
  );
  const datasheetParam = (dataAttr?.getCollectionAttrs ?? [])
    .filter(
      (item: string) =>
        !["_id", "experimentId", "#", "dataSheetId"].includes(item)
    )
    .map((item: string) => ({
      value: item,
      label: item,
    }));

  const { data: expAttr } = useQuery<{ getCollectionAttrs: any[] }>(GET_ATTRS, {
    variables: { collection: "experiments" },
  });

  const experimentParam = (expAttr?.getCollectionAttrs ?? [])
    .filter(
      (item: string) => !["_id", "experimentId", "#", "Notes"].includes(item)
    ) // Exclude specific attributes
    .map((item: string) => ({
      value: item,
      label: item,
    }));

  const { data: xAttr } = useQuery<{ getFilterCollectionAttrValues: any[] }>(
    GET_ATTR_VALUES,
    {
      variables: {
        attribute: selectedParamX,
        collection: selectedParamType,
      },
      skip: !selectedParamX || !selectedParamType,
    }
  );

  const xValues = (xAttr?.getFilterCollectionAttrValues ?? []).map(
    (item: any) => ({
      value: item,
      label: item,
    })
  );

  const { data: yAttr } = useQuery<{ getFilterCollectionAttrValues: any[] }>(
    GET_ATTR_VALUES,
    {
      variables: {
        attribute: selectedParamY,
        collection: selectedParamType,
      },
      skip: !selectedParamY || !selectedParamType,
    }
  );

  const yValues = (yAttr?.getFilterCollectionAttrValues ?? []).map(
    (item: any) => ({
      value: item,
      label: item,
    })
  );

  const steps = ["Graph", "Parameters", "Filter", "Customize"];
  const [activeStep, setActiveStep] = useState(0);
  const [xAxisError, setXAxisError] = useState<string | null>(null);
  const [yAxisError, setYAxisError] = useState<string | null>(null);
  const [titleError, setTitleError] = useState<string | null>(null);

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
    if (!validateAxisRange() || !setGraphTitle) { // Add title check
      if (!setGraphTitle) setTitleError("Graph title is required");
      return;
    }
    setOpenModal(false);
    onSubmit();
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
                  value={selectedGraphType}
                />
              }
            />
          )}

          {/* Parameters */}
          {activeStep === 1 && (
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
                    value={selectedParamType}
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
                      value={selectedParamX}
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
                      value={selectedParamY}
                    />
                  </div>
                }
              />
            </div>
          )}

          {/* Data */}
          {activeStep === 2 && (
            <div>
              <Input
                label="Filter Parameters"
                description="Filter by a value"
                children={
                  <div>
                    <SingleDropdown
                      options={xValues}
                      label={selectedParamX}
                      onChange={setXValue}
                      value={xValue}
                    />
                    <SingleDropdown
                      options={yValues}
                      label={selectedParamY}
                      onChange={setYValue}
                      value={yValue}
                    />
                  </div>
                }
              />
            </div>
          )}

          {/* Customize */}
          {activeStep === 3 && (
            <div>
              <div className="flex items-center mb-6 justify-between">
                <h2 className="text-l pe-2">Graph Title</h2>
                <TextField
                  label="Title"
                  margin="dense"
                  variant="outlined"
                  required
                  error={!!titleError}
                  helperText={titleError}
                  onChange={(e) => {
                    setGraphTitle(e.target.value);
                    if (titleError) setTitleError(null);
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
