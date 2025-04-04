import { useState } from "react";
import { ClickAwayListener } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client";
import { useAuth } from "../../context/authContext";

const LOGOUT = gql`
  mutation logout($token: String!) {
    logout(token: $token) {
      status
      message
    }
  }
`;

const AccountMenu = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { cookies, handleLogout } = useAuth();
  const [logout] = useMutation(LOGOUT);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleClickOutside = () => {
    setIsMenuOpen(false);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const { data } = await logout({
        variables: { token: cookies.session },
      });
      if (data?.logout?.status === "success") {
        handleLogout();
        navigate("/");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
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
          <div className="absolute flex w-auto p-1 mb-2 left-16 bg-white shadow-lg rounded-lg z-auto text-red-700 whitespace-nowrap text-lg">
            <button
              onClick={handleSubmit}
              className="py-2 px-4 cursor-pointer text-left rounded-lg hover:bg-gray-200 transition-all disabled:bg-white"
              disabled={loading}
            >
              {loading ? <span>Logging out...</span> : <span>Logout</span>}
            </button>
          </div>
        </ClickAwayListener>
      )}
    </div>
  );
};

export default AccountMenu;
