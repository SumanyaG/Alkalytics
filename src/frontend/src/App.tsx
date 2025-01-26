import "./App.css";
import Layout from "./components/Layout";
import TableView from "./pages/TableView";
import Upload from "./pages/Upload";
import Dashboard from "./pages/Dashboard";
import { Route, Routes } from "react-router-dom";

function App() {
  return (
    <div className=" bg-gradient-to-b from-blue-50 to-blue-100">
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/table" element={<TableView />} />
          {/* CHANGE TO GRAPH PAGE */}
          <Route path="/graphs" element={<Dashboard />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
