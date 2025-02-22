import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import ErrorIcon from "@mui/icons-material/Error";

const REGISTER_MUTATION = gql`
  mutation register($email: String!, $password: String!, $role: String!) {
    register(email: $email, password: $password, role: $role) {
      status
      message
    }
  }
`;

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [register] = useMutation(REGISTER_MUTATION);

  const navigate = useNavigate();

  const routeChange = () => {
    navigate("/login");
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?!.* ).{8,16}$/;
    return passwordRegex.test(password);
  };

  const passwordHelperText =
    password.length > 0 ? (
      <div className="text-xs text-gray-500 mt-2 mx-0 px-0">
        <div>• Must be at least 8 characters</div>
        <div>• Contain at least one uppercase letter</div>
        <div>• Contain at least one number</div>
      </div>
    ) : (
      ""
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!validateEmail(email)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      setErrorMessage(
        "Password must be at least 8 characters long, contain at least one uppercase letter and one number."
      );
      return;
    }

    try {
      await register({
        variables: { email, password, role },
      });
      routeChange();
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
        <h2 className="text-lg font-semibold text-center mb-6">Register</h2>
        <form
          method="POST"
          onSubmit={handleSubmit}
          className="flex flex-col space-y-6 w-[250px]"
        >
          <TextField
            id="outlined-basic"
            label="Email"
            type="email"
            variant="outlined"
            onChange={(e) => setEmail(e.target.value)}
            required
            error={!!errorMessage && errorMessage.includes("valid email")}
            helperText={
              errorMessage &&
              errorMessage.includes("valid email") &&
              "Please enter a valid email address."
            }
          />
          <TextField
            id="outlined-password-input"
            label="Password"
            type="password"
            autoComplete="current-password"
            onChange={(e) => setPassword(e.target.value)}
            required
            error={!!errorMessage && errorMessage.includes("Password")}
            helperText={passwordHelperText}
          />
          <FormControl fullWidth>
            <InputLabel id="role-select-label">Select Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={role}
              label="Select Role"
              onChange={(e) => setRole(e.target.value as string)}
              required
            >
              <MenuItem value="admin">Admin</MenuItem>
              <MenuItem value="researcher">Researcher</MenuItem>
              <MenuItem value="assistant">Research Assistant</MenuItem>
            </Select>
          </FormControl>
          <button
            type="submit"
            className="mt-4 bg-blue-600 text-white py-3 px-6 rounded-xl hover:bg-blue-700 shadow-md transition-transform transform hover:scale-105 font-semibold"
          >
            Register
          </button>
        </form>
        <button onClick={routeChange} className="mt-6">
          Already have an account?
          <span className="text-blue-700 font-semibold"> Login</span>
        </button>

        {error && (
          <div className="mt-8 text-red-600 flex items-center">
            <ErrorIcon className="mr-2" />
            There was a problem creating your account.
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
