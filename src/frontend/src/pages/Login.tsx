import type React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { gql, useMutation } from "@apollo/client";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [login] = useMutation(LOGIN_MUTATION);
  const { handleLogin } = useAuth();

  const navigate = useNavigate();

  const routeChange = () => {
    navigate("/register");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
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
        setErrorMessage(data?.login?.message);
      }
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
            <p className="text-sm text-blue-300">Access your dashboard</p>
          </div>

            <form method="POST" onSubmit={handleSubmit} className="space-y-6">
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
              <a
                href="/login"
                className="text-xs text-blue-400/90 hover:text-blue-300"
              >
                Forgot password?
              </a>
              </div>
              <div className="group relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
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
                <span className="relative z-10">Signing in...</span>
                </>
              ) : (
                <>
                <span className="relative z-10">Sign in</span>
                </>
              )}
              </span>
              <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100"></span>
              <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 group-hover:w-full"></span>
            </button>
            </form>

          {error && (
            <div className="mt-6 flex items-center rounded-lg border border-red-500/30 bg-red-500/20 px-4 py-3 text-sm text-red-200 backdrop-blur-sm">
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
              {errorMessage
                ? errorMessage
                : "There was a problem signing you in."}
            </div>
          )}

          <div className="mt-8 text-center">
            <button
              onClick={routeChange}
              className="group relative text-sm text-blue-300 transition-colors hover:text-blue-200"
            >
              Don't have an account?
              <span className="ml-1 font-bold text-blue-400 group-hover:text-blue-300">
                Create one
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
