import "./App.css";
import Sidebar from "./components/sidebars/Sidebar";
import TableView from "./pages/TableView";
import Upload from "./pages/Upload";

function App() {
  return (
    <div className=" bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="flex bg-gradient-to-b from-blue-50 to-blue-100">
        <Sidebar />
      </div>
      <Upload />
      <TableView />
    </div>
  );
}

export default App;
