import { useAuth } from "../../context/authContext";


const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) return (
      <div className="flex flex-col justify-center items-center h-screen bg-blue-100 text-center">
        <h2 className="text-3xl font-semibold text-blue-800 mb-4">Access Restricted</h2>
        <p className="text-lg text-gray-600">You must be logged in to view this page.</p>
        <a href="/login" className="mt-4 font-semibold text-lg text-blue-600 hover:text-blue-800">
            Login
        </a>
      </div>
    );
    return <>{children}</>;
};

export default ProtectedRoute;