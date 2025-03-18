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
      <div className="text-xs text-blue-300 mt-2 mx-0 px-0">
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050b2e] bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]">
      {/* Glowing orbs */}
      <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-600/20 blur-3xl"></div>
      <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>

      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.1)_1px,transparent_1px)] bg-[size:40px_40px]"></div>

      <div className="relative w-full max-w-md px-8 py-10 sm:px-10 sm:py-12">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_8px_32px_rgba(59,130,246,0.3)]">
          {/* Logo glow effect */}
          <div className="relative mb-8 text-center">
            <div className="absolute left-1/2 top-1/2 h-12 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/20 blur-xl"></div>
            <h1 className="relative mb-2 bg-gradient-to-r white bg-clip-text text-3xl font-bold text-transparent">
              Alkalytics
            </h1>
            <p className="text-sm text-blue-300">Create your account</p>
          </div>

          <form method="POST" onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-blue-300">
                Email
              </label>
              <div className="group relative">
                <TextField
                  id="email"
                  type="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-blue-200/30 focus:border-blue-400/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Enter your email"
                  error={!!errorMessage && errorMessage.includes("valid email")}
                  helperText={
                    errorMessage &&
                    errorMessage.includes("valid email") &&
                    "Please enter a valid email address."
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-sm text-blue-300"
                >
                  Password
                </label>
              </div>
              <div className="group relative">
                <TextField
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="!pb-2 w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-blue-200/30 focus:border-blue-400/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Enter your password"
                  error={!!errorMessage && errorMessage.includes("Password")}
                  helperText={passwordHelperText}
                />
              </div>
            </div>

            <FormControl fullWidth className="group relative text-white">
              <label
                id="role-select-label"
                className="block text-sm text-blue-300"
              >
                Select Role
              </label>
              <Select
                labelId="role-select-label"
                id="role-select"
                value={role}
                onChange={(e) => setRole(e.target.value as string)}
                required
                className="w-full rounded-lg border border-white/10 bg-white text-sm text-white outline-none transition-all placeholder:text-blue-200/30 focus:border-blue-400/50 focus:bg-white/10 focus:ring-2 focus:ring-blue-400/20"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="researcher">Researcher</MenuItem>
                <MenuItem value="assistant">Research Assistant</MenuItem>
              </Select>
            </FormControl>

            <button
              type="submit"
              className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.5)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(79,70,229,0.7)]"
            >
              <span className="relative z-10">Register</span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </form>

          {error && (
            <div className="mt-6 flex items-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
              <ErrorIcon className="mr-2 h-5 w-5" />
              There was a problem creating your account.
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={routeChange}
              className="group relative text-sm text-blue-300 transition-colors hover:text-blue-200"
            >
              Already have an account?
              <span className="ml-1 font-bold text-blue-400 group-hover:text-blue-300">
                Login
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
