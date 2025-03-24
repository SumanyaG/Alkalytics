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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="size-7"
        >
          <path
            fill-rule="evenodd"
            d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z"
            clip-rule="evenodd"
          />
        </svg>
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
