// -----------------------------------------------------------------------------
// Primary Author: Jennifer Y
// Year: 2025
// Component: SingleDropdown
// Purpose: Custom MUI dropdown component for selecting single option.
// -----------------------------------------------------------------------------

import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

interface SelectAutoWidthProps {
  options: { value: string; label: string }[];
  label: string;
  value: string;
  onChange: any;
  required?: boolean;
  error?: boolean;
}

const SingleDropdown: React.FC<SelectAutoWidthProps> = ({
  options,
  label,
  value,
  onChange,
  required = false,
  error = false,
}) => {
  return (
    <div>
      <FormControl
        sx={{ m: 1, minWidth: 200 }}
        error={error}
        required={required}
        size="small"
      >
        <InputLabel id="graph-select-label">{label}</InputLabel>
        <Select
          autoWidth
          label={label}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {/* Map through the graph types */}
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default SingleDropdown;
