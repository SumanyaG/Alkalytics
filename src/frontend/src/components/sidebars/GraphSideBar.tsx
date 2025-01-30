import { useContext, useState } from "react";
import IconButton from "@mui/material/IconButton";
import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import AddIcon from "@mui/icons-material/Add";
import Button from "@mui/material/Button";
import GenerateGraphModal from "../datavisualizeform/DataFormModal";
import { FormDataContext } from "../../pages/DataVisualize";

const Sidebar: React.FC = () => {
  const [open, setOpen] = useState<boolean>(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    setSelectedGraphType,
    setSelectedDates,
    setSelectedParamType,
    setSelectedParamX,
    setSelectedParamY,
    setTimeMinX,
    setTimeMaxX,
    setTimeMinY,
    setTimeMaxY,
    setMinX,
    setMaxX,
    setMinY,
    setMaxY,
    setGraphTitle,
    setXLabel,
    setYLabel,
  } = useContext(FormDataContext);

  const resetFields = () => {
    setSelectedGraphType("");
    setSelectedDates([]);
    setSelectedParamType("");
    setSelectedParamX("");
    setSelectedParamY("");
    setTimeMinX("");
    setTimeMaxX("");
    setTimeMinY("");
    setTimeMaxY("");
    setMinX("");
    setMaxX("");
    setMinY("");
    setMaxY("");
    setGraphTitle("");
    setXLabel("");
    setYLabel("");
  };

  return (
    <div className="flex">
      <div
        className={`${
          open ? "w-72" : "w-20"
        } bg-slate-100 h-screen p-5 pt-2 relative duration-200`}
      >
        <ul className="gap-x-2 pt-6">
          <li>
            <IconButton
              color="inherit"
              onClick={() => setOpen(!open)}
              className={`absolute -right-3 w-7 ${!open && "rotate-180"}`}
            >
              <KeyboardDoubleArrowRightIcon />
            </IconButton>
          </li>
          <li
            className={`flex rounded-md hover:bg-light-white text-sm items-center gap-x-4 
              ${open ? "p-2" : "p-0"}`}
          >
            <Button
              startIcon={<AddIcon />}
              color="inherit"
              onClick={() => {
                setModalOpen(true);
                resetFields();
              }}
            >
              <span
                className={`${
                  !open && "hidden"
                } text-base pl-2 origin-left duration-200`}
              >
                {"Generate Graph"}
              </span>
            </Button>
          </li>
        </ul>
      </div>
      {modalOpen && <GenerateGraphModal setOpenModal={setModalOpen} />}
    </div>
  );
};

export default Sidebar;
