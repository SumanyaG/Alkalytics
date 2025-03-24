import React, { useState, useEffect, useMemo } from "react";

// type Experiment = {
//   id: string;
//   startTime: string;
//   endTime: string;
// };

type EfficiencyModalProps = {
  experiments: string[];
  setIsModalOpen: (isOpen: boolean) => void;
  onComputeEfficiencies: (
    experimentId: string,
    selectedEfficiencies: string[],
    timeInterval: number
  ) => Promise<any>;
};

const EFFICIENCY_OPTIONS = [
  "Current Efficiency (HCl)",
  "Current Efficiency (NaOH)",
  "Voltage Drop Efficiency",
  "Reaction Efficiency",
  "Overall Efficiency",
];

const EfficiencyModal: React.FC<EfficiencyModalProps> = ({
  experiments,
  setIsModalOpen,
  onComputeEfficiencies,
}) => {
  const [selectedExperiment, setSelectedExperiment] = useState<string>("");
  const [selectedTimeInterval, setSelectedTimeInterval] = useState<number>(0);
  const [selectedEfficiencies, setSelectedEfficiencies] = useState<string[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const timeRanges = useMemo(() => {
    const ranges: number[] = [];
    for (let i = 15; i <= 501; i += 15) {
      ranges.push(i);
    }
    return ranges;
  }, []);

  const handleCheckboxChange = (value: string) => {
    setSelectedEfficiencies((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };

  // const calculateIntervals = (start: string, end: string) => {
  //   const startDate = new Date(start);
  //   const endDate = new Date(end);
  //   const maxDuration = Math.floor(
  //     (endDate.getTime() - startDate.getTime()) / 60000
  //   );

  //   const validTimeRanges: number[] = [];
  //   for (let i = 15; i <= maxDuration; i += 15) {
  //     validTimeRanges.push(i);
  //   }
  //   setTimeRanges(validTimeRanges);
  // };

  useEffect(() => {
    if (selectedExperiment) {
      const experiment = experiments.find((exp) => exp === selectedExperiment);
      if (experiment) {
        //calculateIntervals(experiment.startTime, experiment.endTime);
      }
    }
  }, [selectedExperiment]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(false);
      const response = await onComputeEfficiencies(
        selectedExperiment,
        selectedEfficiencies,
        selectedTimeInterval
      );
      if (response && response.success) {
        setLoading(false);
        setIsModalOpen(false);
      } else {
        setLoading(false);
        setError(true);
      }
    } catch (err) {
      setLoading(false);
      setError(true);
      console.error("Error computing efficiencies:", err);
      setErrorMessage(String(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className={`w-full max-w-xl overflow-hidden rounded-xl border bg-white/95 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-sm transition-all ${
          loading
            ? "border-yellow-300/50"
            : error
            ? "border-red-300/50"
            : "border-white/20"
        }`}
      >
        <div className="flex flex-col h-full">
          <h1 className="mb-4 text-xl font-bold text-blue-900">
            Compute Efficiency Factors
          </h1>

          {/* Experiment Selection */}
          <section className="justify-start my-4">
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-blue-900">
                Select an Experiment
              </label>
              <select
                className="w-full appearance-none rounded-lg border border-blue-100 bg-white/80 px-4 py-3 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedExperiment}
                onChange={(e) => setSelectedExperiment(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select Experiment
                </option>
                {experiments.map((exp) => (
                  <option key={exp} value={exp}>
                    {exp}
                  </option>
                ))}
              </select>
            </div>

            {/* Time Interval Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-blue-900">
                Select a Time Interval
              </label>
              <select
                className="w-full appearance-none rounded-lg border border-blue-100 bg-white/80 px-4 py-3 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200"
                value={selectedTimeInterval}
                onChange={(e) =>
                  setSelectedTimeInterval(Number(e.target.value))
                }
                required
              >
                <option value="" disabled>
                  Select Time Interval
                </option>
                {timeRanges.map((interval, index) => (
                  <option
                    key={interval}
                    value={index === timeRanges.length - 1 ? 0 : interval}
                  >
                    {index === timeRanges.length - 1
                      ? "Full Experiment Duration"
                      : `${interval} Minutes`}
                  </option>
                ))}
              </select>
              {selectedTimeInterval === 0 && (
                <p className="text-sm mt-1">
                  This will calculate the selected efficiency factors across all
                  experiment data.
                </p>
              )}
              {selectedTimeInterval > 0 && (
                <p className="text-sm mt-1">
                  This will calculate the selected efficiency factors over the
                  first{" "}
                  <span className="font-bold">{selectedTimeInterval}</span>{" "}
                  minutes of the experiment data.
                </p>
              )}
            </div>

            {/* Efficiencies Selection */}
            <div className="mb-4">
              <label className="mb-2 block text-sm font-semibold text-blue-900">
                Select Efficiency Factors
              </label>
              <div className="w-full appearance-none rounded-lg border border-blue-100 bg-white/80 px-4 py-3 text-sm text-blue-900 shadow-sm backdrop-blur-sm transition-all focus:border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-200">
                {EFFICIENCY_OPTIONS.map((efficiency) => (
                  <label
                    key={efficiency}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      value={efficiency}
                      checked={selectedEfficiencies.includes(efficiency)}
                      onChange={() => handleCheckboxChange(efficiency)}
                      className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      {" "}
                      {efficiency} - &eta;
                      <sub>
                        {efficiency.includes("Current") && "c"}
                        {efficiency.includes("Voltage") && "v"}
                        {efficiency.includes("Reaction") && "r"}
                        {efficiency.includes("Overall") && "OE"}
                      </sub>
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </section>

          {error && <p className="text-red-600 text-sm">{errorMessage}</p>}

          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-blue-900 shadow-sm ring-1 ring-inset ring-blue-100 transition-all hover:bg-blue-50"
              disabled={loading}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={
                !selectedExperiment || !selectedEfficiencies.length || loading
              }
              className="group relative overflow-hidden rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
            >
              <span className="relative z-10 flex items-center">
                {loading ? (
                  <>
                    <svg
                      className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                      viewBox="0 0 24 24"
                    />
                    <span>Computing...</span>
                  </>
                ) : (
                  <span>Compute Efficiencies</span>
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

export default EfficiencyModal;
