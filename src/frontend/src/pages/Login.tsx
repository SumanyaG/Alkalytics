import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import TextField from "@mui/material/TextField";
import ErrorIcon from "@mui/icons-material/Error";
import { useAuth } from "../context/authContext";

const LOGIN_MUTATION = gql`
  mutation login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      status
      message
      token
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [login] = useMutation(LOGIN_MUTATION);
  const { handleLogin } = useAuth();

  const navigate = useNavigate();

  const routeChange = () => {
    navigate("/register");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({
        variables: { email, password },
      });

      if (data?.login?.status === "success") {
        const token = data?.login?.token;
        handleLogin(token);
        navigate("/dashboard");
      } else {
        setError(true);
      }
    } catch (err) {
      setError(true);
      console.log(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="flex flex-col items-center justify-center w-[80vw] max-w-[600px] min-h-[400px] h-auto rounded-3xl p-8 mb-8 bg-[#fdfdfd] shadow-lg border border-gray-200 transition-transform duration-300">
        <h1 className="text-4xl text-blue-900 font-bold text-center mb-4">
          Alkalytics
        </h1>
        <h2 className="text-lg font-semibold text-center mb-6">Login</h2>
        <form
          method="POST"
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6"
        >
          <TextField
            id="outlined-basic"
            label="Email"
            type="email"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="outlined-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105 font-semibold"
          >
            Login
          </button>
        </form>
        <button onClick={routeChange} className="mt-6">
          Don't have an account?
          <span className="text-blue-700 font-semibold"> Register</span>
        </button>

        {error && (
          <div className="mt-8 text-red-600 flex items-center">
            <ErrorIcon className="mr-2" />
            There was a problem logging you in.
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
