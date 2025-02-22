import { useState } from "react";
import Person from "@mui/icons-material/Person";
import { ClickAwayListener } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";

const AccountMenu = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { handleLogout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = () => {
    setIsMenuOpen(false);
  };

  const handleSubmit = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <div className="flex flex-col relative justify-end items-center z-50">
      <button
        onClick={toggleMenu}
        className="flex justify-center items-center p-4 rounded-full hover:scale-110"
      >
        <Person className="scale-125" />
      </button>

      {isMenuOpen && (
        <ClickAwayListener onClickAway={handleClickOutside}>
          <div className="absolute mb-2 left-16 bg-white shadow-lg rounded-lg w-20 z-auto text-red-700">
            <button
              onClick={handleSubmit}
              className="block w-full py-2 px-4 cursor-pointer text-left hover:bg-gray-200"
            >
              Logout
            </button>
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default AccountMenu;
