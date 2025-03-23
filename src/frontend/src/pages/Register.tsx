import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    setLoading(true);

    try {
      await register({
        variables: { email, password, role },
      });
      routeChange();
    } catch (err) {
      setError(true);
      console.log(err);
    } finally {
      setLoading(false);
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
            <div className="absolute left-1/2 top-1/2 h-12 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 blur-xl"></div>
            <h1 className="relative mb-2 bg-gradient-to-r white bg-clip-text text-3xl font-bold text-transparent">
              Alkalytics
            </h1>
            <p className="text-sm text-blue-300">Create your account</p>
          </div>

          <form
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-6 max-w-sm mx-auto"
          >
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm text-blue-300">
                Email
              </label>
              <div className="group relative">
                <input
                  id="email"
                  type="email"
                  required
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/50 focus:border-blue-400/50 focus:bg-white/20 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Enter your email"
                />
                {errorMessage && errorMessage.includes("valid email") && (
                  <p className="text-xs text-red-300 mt-1">{errorMessage}</p>
                )}
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
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white outline-none transition-all placeholder:text-white/50 focus:border-blue-400/50 focus:bg-white/20 focus:ring-2 focus:ring-blue-400/20"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-300 hover:text-blue-200"
                >
                  {showPassword ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="1.5"
                      stroke="currentColor"
                      className="size-4"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  )}
                </button>
              </div>
              {!errorMessage && password.length > 0 ? (
                  <div className="text-xs text-blue-300 m-2 px-0 transition-all duration-300 ease-in-out">
                    <div>• Must be at least 8 characters</div>
                    <div>• Contain at least one uppercase letter</div>
                    <div>• Contain at least one number</div>
                  </div>
                ) : (
                  ""
                )}
                {errorMessage && errorMessage.includes("Password") && (
                  <p className="text-xs text-red-300 mt-1">{errorMessage}</p>
                )}
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="block text-sm text-blue-300">
                Role
              </label>
              <div className="group relative">
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                  className="w-full rounded-lg border border-white/20 bg-white/10 p-3 text-sm text-white outline-none transition-all focus:border-blue-400/50 focus:bg-white/20 focus:ring-2 focus:ring-blue-400/20 appearance-none"
                >
                  <option value="" disabled>
                    Select a role
                  </option>
                  <option value="admin">Admin</option>
                  <option value="researcher">Researcher</option>
                  <option value="assistant">Research Assistant</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative flex items-center justify-center w-full overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 py-3 text-sm font-bold text-white shadow-[0_4px_10px_rgba(59,130,246,0.5)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(79,70,229,0.7)] disabled:opacity-50"
            >
              <span className="relative z-10 flex items-center">
              {loading ? (
                <>
                <svg
                  className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                  viewBox="0 0 24 24"
                />
                <span className="relative z-10">Creating account...</span>
                </>
              ) : (
                <>
                <span className="relative z-10">Create account</span>
                </>
              )}
              </span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
          </form>

          {error && (
            <div className="mt-6 flex items-center rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300 backdrop-blur-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
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
                Sign in
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
