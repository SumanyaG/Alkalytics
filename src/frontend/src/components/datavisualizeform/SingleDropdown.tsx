import * as React from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";

// Define the prop type for the SelectAutoWidth component
interface SelectAutoWidthProps {
  options: { value: string; label: string }[];
  label: string;
  onChange: any;
  required?: boolean;
  error?: boolean;
}

const SingleDropdown: React.FC<SelectAutoWidthProps> = ({
  options,
  label,
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
