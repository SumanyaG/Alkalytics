import { useAuth } from "../../context/authContext";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col h-screen justify-center items-center bg-white">
        {/* Background elements */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,23,97,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,23,97,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-blue-100 blur-3xl"></div>
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-indigo-100 blur-3xl"></div>

        <div className="relative w-full max-w-md px-8 py-10 sm:px-10 sm:py-12">
          <div className="rounded-2xl border border-gray-200 bg-white/80 p-8 shadow-lg backdrop-blur-md">
            <div className="relative mb-8 text-center">
              <div className="absolute left-1/2 top-1/2 h-12 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-100/50 blur-xl"></div>
              <div className="flex justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <h2 className="relative mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent">
                Access Restricted
              </h2>
              <p className="text-base text-gray-600">
                You must be signed in to view this page.
              </p>
            </div>

            <div className="space-y-6">
              <a
                href="/login"
                className="block w-full text-center px-8 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-sm font-bold text-white shadow-[0_4px_20px_rgba(59,130,246,0.5)] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(79,70,229,0.7)] relative overflow-hidden"
              >
                <span className="relative z-10">Sign in</span>
                <span className="absolute inset-0 h-full w-full bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 hover:opacity-100 rounded-lg"></span>
                <span className="absolute bottom-0 left-0 h-1 w-0 bg-gradient-to-r from-cyan-400 to-blue-400 transition-all duration-300 hover:w-full"></span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
