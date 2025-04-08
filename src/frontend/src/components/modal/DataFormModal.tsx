// -----------------------------------------------------------------------------
// Primary Author: Jennifer Y
// Year: 2025
// Component: DataFormModal
// Purpose: Modal component for creating a new graph.
// -----------------------------------------------------------------------------

import React, { useContext, useState } from "react";
import CloseIcon from "@mui/icons-material/Close";
import { Stepper, Step, StepLabel, TextField, IconButton } from "@mui/material";
import SingleDropdown from "../dropdown/SingleDropdown";
import ExpandableSection from "../expandable/ExpandableSection";
import { FormDataContext } from "../../pages/DataVisualize";
import { useQuery, gql } from "@apollo/client";
import MultipleSelectCheckmarks from "../dropdown/MultiSelectDropDown";

interface GenerateGraphModalProps {
  setOpenModal: React.Dispatch<React.SetStateAction<boolean>>;
  onSubmit: any;
  onClose: any;
}
const graphTypes = [
  { value: "bar", label: "Bar Graph" },
  { value: "line", label: "Line Chart" },
  { value: "scatter", label: "Scatter Plot" },
];
const paramTypes = [
  { value: "data", label: "Raw Data Sheet" },
  { value: "experiments", label: "Experiment Log File" },
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

const FILTER_COLLECTDATE = gql`
  query GetFilterCollectionDates(
    $collection: String!
    $attribute: String!
    $filterValue: JSON!
  ) {
    getFilterCollectionDates(
      attribute: $attribute
      collection: $collection
      filterValue: $filterValue
    )
  }
`;

const GenerateGraphModal: React.FC<GenerateGraphModalProps> = ({
  setOpenModal,
  onSubmit,
  onClose,
}) => {
  // Imported states
  const {
    graphType,
    setGraphType,
    filterParam,
    setFilterParam,
    filterValue,
    setFilterValue,
    paramType,
    setParamType,
    paramX,
    setParamX,
    paramY,
    setParamY,
    selectedDates,
    setSelectedDates,
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

  const { data: filterVals } = useQuery<{
    getFilterCollectionAttrValues: any[];
  }>(GET_ATTR_VALUES, {
    variables: {
      collection: "experiments",
      attribute: filterParam,
    },
    skip: !filterParam
  });

  const filterValues = (filterVals?.getFilterCollectionAttrValues ?? []).map(
    (item: any) => ({
      value: item,
      label: item,
    })
  );

  const { data: filteredDates } = useQuery<{
    getFilterCollectionDates: any[];
  }>(FILTER_COLLECTDATE, {
    variables: {
      collection: "experiments",
      attribute: filterParam,
      filterValue: filterValue,
    },
    skip: !filterParam || !filterValue,
  });

  const filterDates = filteredDates?.getFilterCollectionDates ?? [];

  const { data: dates } = useQuery<{
    getFilterCollectionDates: any[];
  }>(FILTER_COLLECTDATE, {
    variables: {
      collection: "experiments",
      attribute: "",
      filterValue: "",
    },
    skip: Boolean(filterParam),
  });

  const allDates = dates?.getFilterCollectionDates ?? [];

  const steps = ["Graph", "Filter", "Parameters", "Date", "Customize"];
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
      return !graphType;
    }
    if (activeStep === 1) {
      return !(
        (!filterParam &&
          !filterValue) ||
        (filterParam && filterValue)
      );
    }
    if (activeStep === 2) {
      return !paramType || !paramX || !paramY;
    }
    if (activeStep === 3) {
      return selectedDates.length === 0;
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
    if (!validateAxisRange() || !setGraphTitle) {
      // Add title check
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
    if (paramX === "Time") {
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
    if (paramY === "Time") {
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
    <div className="fixed flex justify-center items-center inset-0 z-50 bg-gray-200 bg-opacity-50">
      <div className="max-w-xl w-full bg-white rounded-lg shadow-lg flex flex-col p-5 ">
        <div className="flex justify-between items-center border-b">
          <h1 className="text-xl">Generate Graph</h1>
          <IconButton
            onClick={() => {
              setOpenModal(false);
              onClose();
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
                  onChange={setGraphType}
                  value={graphType}
                />
              }
            />
          )}

          {/* Filter */}
          {activeStep === 1 && (
            <div>
              <p className="text-sm text-gray-600 font-medium -mt-4 mb-6 mx-6">
                Filter out experiments by an attribute in the experiment log. If no filter is selected, all experiments will be included when selecting experiment dates.
              </p> 
              <Input
                label="Filter Condition"
                description="Select an attribute from the experiment log to filter by"
                children={
                  <div className="flex flex-col text-end">
                    <SingleDropdown
                      options={experimentParam}
                      label="Filter Attribute"
                      onChange={setFilterParam}
                      value={filterParam}
                    />
                  </div>
                }
              />
              <Input
                label="Filter Value"
                description="Select a value for the selected attribute to filter by"
                children={
                  <div>
                    <SingleDropdown
                      options={filterValues}
                      label="Attribute Value"
                      onChange={setFilterValue}
                      value={filterValue}
                    />
                  </div>
                }
              />
            </div>
          )}
          {/* Parameter */}
          {activeStep === 2 && (
            <div>
              <Input
                label="Parameter Type"
                description="Filter with datasheet or experiment attributes"
                children={
                  <SingleDropdown
                    options={paramTypes}
                    label="Param Type"
                    required={true}
                    onChange={setParamType}
                    value={paramType}
                  />
                }
              />
              <Input
                label="Compare Parameters"
                description="Select axis parameters"
                children={
                  <div className="flex flex-col text-end">
                    <SingleDropdown
                      options={
                        paramType === "data"
                          ? datasheetParam
                          : experimentParam
                      }
                      label="X"
                      required={true}
                      onChange={setParamX}
                      value={paramX}
                    />
                    <SingleDropdown
                      options={
                        paramType === "data"
                          ? datasheetParam
                          : experimentParam
                      }
                      label="Y"
                      required={true}
                      onChange={setParamY}
                      value={paramY}
                    />
                  </div>
                }
              />
            </div>
          )}
          {/* Date */}
          {activeStep === 3 && (
            <Input
              label="Experiment Dates"
              description=" Select the experimental date(s) of the datasheet(s)"
              children={
                <MultipleSelectCheckmarks
                  dates={filterDates.length > 0 ? filterDates : allDates}
                  required={true}
                  values={selectedDates}
                  onChange={setSelectedDates}
                />
              }
            />
          )}
          {/* Customize */}
          {activeStep === 4 && (
            <div>
              <div className="flex items-center mb-6 justify-between">
                <h2 className="text-l pe-2">Graph Title</h2>
                <TextField
                  label="Title"
                  margin="dense"
                  variant="outlined"
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
                      {paramX === "Time" ? (
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
                      {paramY === "Time" ? (
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
