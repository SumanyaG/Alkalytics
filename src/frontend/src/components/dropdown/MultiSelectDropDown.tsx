// -----------------------------------------------------------------------------
// Primary Author: Jennifer Y
// Year: 2025
// Component: MultiSelectDropDown
// Purpose: Custom MUI dropdown component for selecting multiple dates with checkboxes.
// -----------------------------------------------------------------------------

import * as React from "react";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import ListItemText from "@mui/material/ListItemText";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import Checkbox from "@mui/material/Checkbox";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";

// Constants for dropdown styling
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

interface MultipleSelectCheckmarksProps {
  dates: string[];
  values: string[];
  onChange: any;
  required?: boolean;
  error?: boolean;
}

const MultipleSelectCheckmarks: React.FC<MultipleSelectCheckmarksProps> = ({
  dates,
  values,
  onChange,
  required = false,
  error = false,
}) => {
  const handleChange = (event: SelectChangeEvent<typeof values>) => {
    const {
      target: { value },
    } = event;
    onChange(typeof value === "string" ? value.split(",") : value);
  };

  return (
    <div>
      <FormControl
        sx={{ m: 1, maxWidth: 400, minWidth: 150 }}
        error={error}
        required={required}
        size="small"
      >
        <InputLabel>Select Date</InputLabel>
        <Select
          multiple
          value={values}
          margin="dense"
          onChange={handleChange}
          input={<OutlinedInput label="Select Dates" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {selected.map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
        >
          {dates.map((date, index) => (
            <MenuItem key={index} value={date}>
              <Checkbox checked={values.includes(date)} />
              <ListItemText primary={date} />
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default MultipleSelectCheckmarks;
