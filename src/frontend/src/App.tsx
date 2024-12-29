import "./App.css";
import Sidebar from "./components/Sidebar";
import Upload from "./pages/Upload";

function App() {
  return (
    <>
      <div className="flex">
        <Sidebar />
      </div>
      <Upload />
    </>
  );
}

export default App;
