import "./App.css";
import { Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import TableView from "./pages/TableView";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-blue-100">
      <AuthProvider>
        <Routes>
          <Route path="*" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/table" element={<TableView />} />
            {/* CHANGE TO GRAPH PAGE */}
            <Route path="/graphs" element={<Dashboard />} />
          </Route>
        </Routes>
      </AuthProvider>
    </div>
  );
}

export default App;
